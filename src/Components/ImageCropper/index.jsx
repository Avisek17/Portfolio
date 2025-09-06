import React, { useState, useRef, useEffect } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import './styles.scss';

const ImageCropper = ({
  imageSrc,
  onCropComplete,
  onCancel,
  aspectRatio = 1,
  cropShape = 'round',
  minWidth = 200,
  minHeight = 200,
}) => {
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState(null);
  const imageRef = useRef(null);
  const canvasRef = useRef(null);

  // Center and create initial crop when image loads
  const onImageLoad = (e) => {
    const { width, height } = e.currentTarget;
    
    const crop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 90,
        },
        aspectRatio,
        width,
        height
      ),
      width,
      height
    );
    
    setCrop(crop);
  };

  // Generate cropped image when crop changes
  useEffect(() => {
    if (!completedCrop || !imageRef.current || !canvasRef.current) {
      return;
    }

    const image = imageRef.current;
    const canvas = canvasRef.current;
    const crop = completedCrop;
    
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    
    const ctx = canvas.getContext('2d');
    
    // Set canvas size to match the cropped image
    const pixelRatio = window.devicePixelRatio;
    canvas.width = crop.width * scaleX * pixelRatio;
    canvas.height = crop.height * scaleY * pixelRatio;
    
    // Scale the canvas for high DPI displays
    ctx.scale(pixelRatio, pixelRatio);
    ctx.imageSmoothingQuality = 'high';
    
    // Draw the cropped image on the canvas
    const cropX = crop.x * scaleX;
    const cropY = crop.y * scaleY;
    const cropWidth = crop.width * scaleX;
    const cropHeight = crop.height * scaleY;
    
    ctx.drawImage(
      image,
      cropX, cropY, cropWidth, cropHeight,
      0, 0, cropWidth, cropHeight
    );
  }, [completedCrop]);

  // Convert canvas to Blob when Apply button is clicked
  const handleApplyCrop = () => {
    if (!completedCrop || !canvasRef.current) {
      return;
    }
    
    canvasRef.current.toBlob((blob) => {
      if (!blob) {
        console.error('Canvas is empty');
        return;
      }
      
      // Create a File object from the Blob
      const croppedFile = new File([blob], 'cropped-image.png', { 
        type: 'image/png',
        lastModified: new Date().getTime()
      });
      
      onCropComplete(croppedFile, false); // false indicates this is a cropped image
    }, 'image/png', 1.0);
  };

  return (
    <div className="image-cropper">
      <div className="image-cropper__header">
        <h3 className="image-cropper__title">Adjust Image</h3>
        <p className="image-cropper__subtitle">You can crop this image or use the original version</p>
      </div>
      
      <div className="image-cropper__content">
        <ReactCrop
          crop={crop}
          onChange={(c) => setCrop(c)}
          onComplete={(c) => setCompletedCrop(c)}
          aspect={aspectRatio}
          circularCrop={cropShape === 'round'}
          minWidth={minWidth}
          minHeight={minHeight}
        >
          <img
            ref={imageRef}
            src={imageSrc}
            alt="Crop preview"
            onLoad={onImageLoad}
            crossOrigin="anonymous"
          />
        </ReactCrop>
        
        {/* Hidden canvas for generating the cropped image */}
        <canvas
          ref={canvasRef}
          style={{ display: 'none' }}
        />
      </div>
      
      <div className="image-cropper__controls">
        <div className="image-cropper__buttons">
          <button 
            type="button" 
            className="image-cropper__button image-cropper__button--secondary"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button 
            type="button" 
            className="image-cropper__button image-cropper__button--original"
            onClick={() => {
              // This will pass the original file without cropping
              fetch(imageSrc)
                .then(res => res.blob())
                .then(blob => {
                  // Create a File object from the original image
                  const originalFile = new File([blob], 'original-image.png', { 
                    type: 'image/png',
                    lastModified: new Date().getTime()
                  });
                  onCropComplete(originalFile, true); // true indicates this is the original image
                });
            }}
          >
            Use Full Image
          </button>
          <button 
            type="button" 
            className="image-cropper__button image-cropper__button--primary"
            onClick={handleApplyCrop}
            disabled={!completedCrop}
          >
            Save Cropped Image
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropper;