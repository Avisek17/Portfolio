import React, { useState, useRef } from 'react';
import { uploadAPI, formatImageUrl } from '../../services/api';
import ImageCropper from '../ImageCropper';
import './styles.scss';

const ImageUpload = ({ 
  onImageSelect, 
  currentImage = null, 
  label = "Upload Image",
  accept = "image/*",
  maxSize = 15 * 1024 * 1024, // 15MB default - increased to match backend
  className = "",
  enableCropping = true,
  cropAspectRatio = 1,
  cropShape = "round",
  showCroppingToggle = false
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [preview, setPreview] = useState(
    currentImage?.url 
      ? formatImageUrl(currentImage.url) 
      : typeof currentImage === 'string' && currentImage 
        ? formatImageUrl(currentImage) 
        : null
  );
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [tempImageUrl, setTempImageUrl] = useState(null);
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    // Check file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return false;
    }

    // Check file size
    if (file.size > maxSize) {
      setError(`File size must be less than ${Math.round(maxSize / (1024 * 1024))}MB`);
      return false;
    }

    setError('');
    return true;
  };

  const prepareImageForCropping = (file) => {
    if (!validateFile(file)) return;
    
    // Create temporary URL for the cropper
    const imageUrl = URL.createObjectURL(file);
    setTempImageUrl(imageUrl);
    setSelectedFile(file);
    
    // Show the cropper
    setShowCropper(true);
  };

  const handleCropComplete = async (croppedFile, isOriginal = false) => {
    setShowCropper(false);
    setUploading(true);
    
    try {
      // Create preview immediately for better UX
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target.result);
      };
      reader.readAsDataURL(croppedFile);

      // Add a slightly longer delay for a smoother transition
      await new Promise(resolve => setTimeout(resolve, 300));

      // If this is the original image and we have a cached original URL, use it
      if (isOriginal && tempImageUrl) {
        console.log('Using original image without cropping');
      }

      // Upload cropped file using our API service
      const result = await uploadAPI.uploadImage(croppedFile);

      if (result.status === 'success') {
        const formattedUrl = formatImageUrl(result.imageUrl);
        
        // Add a small delay before updating the preview to ensure smooth transition
        await new Promise(resolve => setTimeout(resolve, 200));
        setPreview(formattedUrl);
        
        // Check if we're dealing with an object or string based image
        if (typeof currentImage === 'string') {
          onImageSelect(result.imageUrl); // For string-based images
        } else {
          onImageSelect({
            url: result.imageUrl,
            alt: croppedFile.name.split('.')[0] // Use filename without extension as default alt
          }); // For object-based images
        }
      } else {
        throw new Error(result.message || 'Upload failed');
      }
    } catch (error) {
      setError('Upload failed: ' + error.message);
      setPreview(currentImage?.url || currentImage);
    } finally {
      setUploading(false);
      // Clean up the temporary URL
      if (tempImageUrl) {
        URL.revokeObjectURL(tempImageUrl);
        setTempImageUrl(null);
      }
    }
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    
    // Clean up the temporary URL
    if (tempImageUrl) {
      URL.revokeObjectURL(tempImageUrl);
      setTempImageUrl(null);
    }
    
    setSelectedFile(null);
  };

  const handleFileSelect = async (file) => {
    if (!validateFile(file)) return;

    // If cropping is enabled, prepare the image for cropping
    if (enableCropping) {
      prepareImageForCropping(file);
      return;
    }

    // Otherwise, proceed with direct upload
    setUploading(true);
    try {
      // Create preview immediately for better UX
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target.result);
      };
      reader.readAsDataURL(file);

      // Upload file using our API service
      const result = await uploadAPI.uploadImage(file);

      if (result.status === 'success') {
        const formattedUrl = formatImageUrl(result.imageUrl);
        setPreview(formattedUrl);
        
        // Check if we're dealing with an object or string based image
        if (typeof currentImage === 'string') {
          onImageSelect(result.imageUrl); // For string-based images
        } else {
          onImageSelect({
            url: result.imageUrl,
            alt: file.name.split('.')[0] // Use filename without extension as default alt
          }); // For object-based images
        }
      } else {
        throw new Error(result.message || 'Upload failed');
      }
    } catch (error) {
      setError('Upload failed: ' + error.message);
      setPreview(currentImage?.url || currentImage);
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleSkipCropping = () => {
    if (selectedFile) {
      // Skip cropping and use the original file
      handleCropComplete(selectedFile, true);
    }
  };

  const handleRemoveImage = () => {
    setPreview(null);
    
    // Check if we're dealing with an object or string based image
    if (typeof currentImage === 'string') {
      onImageSelect(''); // For string-based images
    } else {
      onImageSelect({ url: '', alt: '' }); // For object-based images
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`image-upload ${className}`}>
      <div className="image-upload__header">
        <label className="image-upload__label">{label}</label>
        
        {showCroppingToggle && enableCropping && (
          <label className="image-upload__crop-toggle">
            <input
              type="checkbox"
              checked={enableCropping}
              onChange={() => null} // We can't directly change props, so this is controlled by parent
              className="image-upload__crop-checkbox"
            />
            <span className="image-upload__crop-text">Cropping enabled</span>
          </label>
        )}
      </div>
      
      <div 
        className={`image-upload__area ${isDragOver ? 'image-upload__area--drag-over' : ''} ${uploading ? 'image-upload__area--uploading' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        {preview ? (
          <div className="image-upload__preview">
            <img 
              src={preview} 
              alt="Preview" 
              className="image-upload__preview-image"
              crossOrigin="anonymous"
            />
            <div className="image-upload__preview-overlay">
              <button 
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveImage();
                }}
                className="image-upload__remove-btn"
                title="Remove image"
              >
                🗑️
              </button>
              <button 
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  openFileDialog();
                }}
                className="image-upload__change-btn"
                title="Change image"
              >
                🔄
              </button>
            </div>
          </div>
        ) : (
          <div className="image-upload__placeholder">
            {uploading ? (
              <div className="image-upload__uploading">
                <div className="image-upload__spinner"></div>
                <span>Uploading...</span>
              </div>
            ) : (
              <>
                <div className="image-upload__icon">📸</div>
                <div className="image-upload__text">
                  <span className="image-upload__primary">Click to select an image</span>
                  <span className="image-upload__secondary">or drag and drop here</span>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="image-upload__error">
          {error}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileInputChange}
        className="image-upload__input"
        style={{ display: 'none' }}
      />
      
      {/* Image Cropper Modal */}
      {showCropper && tempImageUrl && (
        <div className="image-cropper-modal">
          <ImageCropper 
            imageSrc={tempImageUrl}
            onCropComplete={handleCropComplete}
            onCancel={handleCropCancel}
            aspectRatio={cropAspectRatio}
            cropShape={cropShape}
          />
        </div>
      )}
    </div>
  );
};

export default ImageUpload;