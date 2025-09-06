import React, { useState, useEffect } from 'react';
import { certificatesAPI, uploadAPI, formatFileUrl, formatImageUrl } from '../../services/api';
import ImageUpload from '../../Components/ImageUpload';

const CertificatesManager = () => {
  const [certificates, setCertificates] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCertificate, setEditingCertificate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    issuer: '',
    description: '',
    issueDate: '',
    expiryDate: '',
    credentialId: '',
    credentialUrl: '',
    category: 'technical',
    level: 'intermediate',
    featured: false,
    priority: 0,
  skills: '',
    image: {
      url: '',
      alt: ''
    },
    file: {
      url: '',
      filename: '',
      originalName: '',
      mimeType: '',
      size: 0
    }
  });

  useEffect(() => {
    loadCertificates();
  }, []);

  const loadCertificates = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await certificatesAPI.getAll();
      console.log('Certificates API Response:', response); // Debug log
      
      if (response.status === 'success') {
        // Handle the nested structure from certificates API
        const certificatesArray = response.data.certificates || response.data || [];
        console.log('Certificates Array:', certificatesArray); // Debug log
        setCertificates(Array.isArray(certificatesArray) ? certificatesArray : []);
      } else {
        setCertificates([]);
        setError('Failed to load certificates: Invalid response');
      }
    } catch (error) {
      console.error('Load Certificates Error:', error); // Debug log
      setError('Failed to load certificates: ' + error.message);
      setCertificates([]); // Ensure certificates is always an array
    }
    setLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageSelect = (imageData) => {
    setFormData(prev => ({
      ...prev,
      image: imageData
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const normalizeUrl = (url) => {
      if (!url) return '';
      if (/^https?:\/\//i.test(url)) return url;
      return `https://${url}`;
    };

    const certificateData = {
      ...formData,
      skills: formData.skills ? formData.skills.split(',').map(skill => skill.trim()).filter(Boolean) : [],
      credentialUrl: normalizeUrl(formData.credentialUrl)
    };

    try {
      let response;
      if (editingCertificate) {
        response = await certificatesAPI.update(editingCertificate._id, certificateData);
      } else {
        response = await certificatesAPI.create(certificateData);
      }

      if (response.status === 'success') {
        await loadCertificates(); // Reload certificates
        resetForm();
        setShowForm(false); // Close the form after successful submission
        // Show success message
        setTimeout(() => {
          alert(`Certificate ${editingCertificate ? 'updated' : 'created'} successfully!`);
        }, 300);
      }
    } catch (error) {
      setError('Failed to save certificate: ' + error.message);
    }
    setLoading(false);
  };

  const handleEdit = (certificate) => {
    setEditingCertificate(certificate);
    setFormData({
      title: certificate.title,
      issuer: certificate.issuer,
      description: certificate.description || '',
      issueDate: certificate.issueDate ? certificate.issueDate.split('T')[0] : '',
      expiryDate: certificate.expiryDate ? certificate.expiryDate.split('T')[0] : '',
      credentialId: certificate.credentialId || '',
      credentialUrl: certificate.credentialUrl || '',
      category: certificate.category || 'technical',
      level: certificate.level || 'intermediate',
      featured: certificate.featured || false,
      priority: certificate.priority || 0,
  skills: Array.isArray(certificate.skills) ? certificate.skills.join(', ') : (certificate.skills || ''),
      image: {
        url: certificate.image?.url || '',
        alt: certificate.image?.alt || ''
      },
      file: {
        url: certificate.file?.url || '',
        filename: certificate.file?.filename || '',
        originalName: certificate.file?.originalName || '',
        mimeType: certificate.file?.mimeType || '',
        size: certificate.file?.size || 0
      }
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this certificate?')) {
      setLoading(true);
      try {
        const response = await certificatesAPI.delete(id);
        if (response.status === 'success') {
          await loadCertificates(); // Reload certificates
        }
      } catch (error) {
        setError('Failed to delete certificate: ' + error.message);
      }
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      issuer: '',
      description: '',
      issueDate: '',
      expiryDate: '',
      credentialId: '',
      credentialUrl: '',
      category: 'technical',
      level: 'intermediate',
      featured: false,
      priority: 0,
  skills: '',
      image: {
        url: '',
        alt: ''
      },
      file: {
        url: '',
        filename: '',
        originalName: '',
        mimeType: '',
        size: 0
      }
    });
    setEditingCertificate(null);
    setShowForm(false);
    setError('');
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  const isExpired = (expiryDate) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  if (loading && !showForm) {
    return <div className="admin-loading">Loading certificates...</div>;
  }

  return (
    <div className="certificates-manager admin-page">
      {/* Page Header */}
      <div className="admin-page__header">
        <div className="admin-page__header-content">
          <h1 className="admin-page__title">Certificates Manager</h1>
          <p className="admin-page__subtitle">Manage your professional certifications and achievements</p>
        </div>
        <div className="admin-page__actions">
          <button 
            className="admin-btn admin-btn--primary"
            onClick={() => setShowForm(true)}
            disabled={loading}
          >
            <span className="admin-btn__icon">🏆</span>
            Add New Certificate
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="admin-error">
          {error}
          <button onClick={() => setError('')} className="admin-error__close">×</button>
        </div>
      )}

      {/* Add/Edit Form Inline */}
      {showForm && (
        <div className="admin-form-section">
          <div className="admin-form-container">
            <div className="admin-form-header">
              <h2>{editingCertificate ? 'Edit Certificate' : 'Add New Certificate'}</h2>
              <button 
                className="admin-btn admin-btn--secondary"
                onClick={resetForm}
              >
                <span className="admin-btn__icon">✕</span>
                Cancel
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className={`admin-form ${loading ? 'admin-form--loading' : ''}`}>
              <div className="admin-form__field">
                <label>Certificate Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="admin-form__field">
                <label>Issuing Organization</label>
                <input
                  type="text"
                  name="issuer"
                  value={formData.issuer}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="admin-form__row">
                <div className="admin-form__field">
                  <label>Issue Date</label>
                  <input
                    type="date"
                    name="issueDate"
                    value={formData.issueDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="admin-form__field">
                  <label>Expiry Date (optional)</label>
                  <input
                    type="date"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <div className="admin-form__row">
                <div className="admin-form__field">
                  <label>Credential ID (optional)</label>
                  <input
                    type="text"
                    name="credentialId"
                    value={formData.credentialId}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="admin-form__field">
                  <label>Credential URL (optional)</label>
                  <input
                    type="text"
                    name="credentialUrl"
                    value={formData.credentialUrl}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="admin-form__field">
                  <ImageUpload
                    label="Certificate Image"
                    onImageSelect={handleImageSelect}
                    currentImage={formData.image.url ? 
                      formData.image :
                      null}
                  />
                </div>
                
                <div className="admin-form__field">
                  <label>Image Alt Text (optional)</label>
                  <input
                    type="text"
                    name="image.alt"
                    value={formData.image.alt}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      image: { ...prev.image, alt: e.target.value }
                    }))}
                    placeholder="Certificate image description"
                  />
                </div>
              </div>
              
              <div className="admin-form__field">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                />
              </div>

              <div className="admin-form__row">
                <div className="admin-form__field">
                  <label>Certificate File (PDF, image, etc.)</label>
                  <input
                    type="file"
                    accept="*/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      try {
                        setLoading(true);
                        const result = await uploadAPI.uploadCertificate(file);
                        if (result.status === 'success') {
                          setFormData(prev => ({
                            ...prev,
                            file: {
                              url: result.file.url,
                              filename: result.file.filename,
                              originalName: result.file.originalName,
                              mimeType: result.file.mimeType,
                              size: result.file.size
                            }
                          }));
                        } else {
                          setError(result.message || 'Failed to upload file');
                        }
                      } catch (err) {
                        setError('File upload failed: ' + err.message);
                      } finally {
                        setLoading(false);
                      }
                    }}
                  />
                  {formData.file?.url && (
                    <div className="admin-file-info">
                      <p>
                        Uploaded: {formData.file.originalName || formData.file.filename} ({Math.round((formData.file.size || 0)/1024)} KB)
                      </p>
                      <div className="admin-form__actions">
                        <a
                          className="admin-btn admin-btn--small admin-btn--link"
                          href={formatFileUrl(formData.file.url)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View
                        </a>
                        <a
                          className="admin-btn admin-btn--small admin-btn--secondary"
                          href={formatFileUrl(`/api/upload/certificate/${encodeURIComponent(formData.file.filename || (formData.file.url || '').split('/').pop() || '')}`)}
                          download={formData.file.originalName || 'certificate'}
                        >
                          Download
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="admin-form__field">
                <label>Related Skills (comma separated)</label>
                <input
                  type="text"
                  name="skills"
                  value={formData.skills}
                  onChange={handleInputChange}
                  placeholder="React, JavaScript, Web Development"
                />
              </div>
              
              <div className="admin-form__actions">
                <button type="button" onClick={resetForm} className="admin-btn admin-btn--secondary">
                  Cancel
                </button>
                <button type="submit" className="admin-btn admin-btn--primary">
                  {editingCertificate ? 'Update' : 'Create'} Certificate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="certificates-manager__list">
        {!Array.isArray(certificates) || certificates.length === 0 ? (
          <div className="admin-empty">
            <p>No certificates yet. Add your first certificate!</p>
            {error && <p className="admin-error">{error}</p>}
          </div>
        ) : (
          <div className="certificates-grid">
            {certificates.map((certificate) => (
              <div key={certificate._id} className="certificate-card">
                {certificate.image && certificate.image.url && (
                  <div className="certificate-card__image-container">
                    <img 
                      src={formatImageUrl(certificate.image.url)} 
                      alt={certificate.image.alt || certificate.title} 
                      className="certificate-card__image" 
                    />
                    <div className="certificate-card__image-actions">
                      <a
                        href={formatImageUrl(certificate.image.url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="admin-btn admin-btn--small admin-btn--link"
                      >
                        View Image
                      </a>
                      <a
                        href={formatFileUrl(`/api/upload/certificate/${encodeURIComponent((certificate.image.url || '').split('/').pop() || '')}`)}
                        download={certificate.image.alt || `${certificate.title}-image`}
                        className="admin-btn admin-btn--small admin-btn--secondary"
                      >
                        Download Image
                      </a>
                    </div>
                  </div>
                )}
                
                <div className="certificate-card__header">
                  <h3 className="certificate-card__title">{certificate.title}</h3>
                  {certificate.expiryDate && isExpired(certificate.expiryDate) && (
                    <span className="certificate-card__status certificate-card__status--expired">
                      Expired
                    </span>
                  )}
                  {certificate.expiryDate && !isExpired(certificate.expiryDate) && (
                    <span className="certificate-card__status certificate-card__status--valid">
                      Valid
                    </span>
                  )}
                  {!certificate.expiryDate && (
                    <span className="certificate-card__status certificate-card__status--permanent">
                      No Expiry
                    </span>
                  )}
                </div>
                
                <div className="certificate-card__content">
                  <p className="certificate-card__issuer">{certificate.issuer}</p>
                  <p className="certificate-card__date">
                    Issued: {formatDate(certificate.issueDate)}
                    {certificate.expiryDate && (
                      <span> • Expires: {formatDate(certificate.expiryDate)}</span>
                    )}
                  </p>
                  
                  {certificate.description && (
                    <p className="certificate-card__description">{certificate.description}</p>
                  )}
                  
                  {certificate.skills && certificate.skills.length > 0 && (
                    <div className="certificate-card__skills">
                      {certificate.skills.map((skill, index) => (
                        <span key={index} className="certificate-card__skill">{skill}</span>
                      ))}
                    </div>
                  )}
                  
                  {certificate.credentialId && (
                    <p className="certificate-card__credential">
                      ID: {certificate.credentialId}
                    </p>
                  )}
                  
                  <div className="certificate-card__actions">
                    {certificate.credentialUrl && (
                      <a 
                        href={/^https?:\/\//i.test(certificate.credentialUrl) ? certificate.credentialUrl : `https://${certificate.credentialUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="admin-btn admin-btn--small admin-btn--link"
                      >
                        View Certificate
                      </a>
                    )}
                    {/* If an image is present but no file attachment, still allow view/download */}
                    {certificate.image?.url && (
                      <>
                        <a
                          href={formatImageUrl(certificate.image.url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="admin-btn admin-btn--small admin-btn--link"
                        >
                          View Image
                        </a>
                        <a
                          href={formatFileUrl(`/api/upload/certificate/${encodeURIComponent((certificate.image.url || '').split('/').pop() || '')}`)}
                          download={certificate.image.alt || `${certificate.title}-image`}
                          className="admin-btn admin-btn--small admin-btn--secondary"
                        >
                          Download Image
                        </a>
                      </>
                    )}
                    {certificate.file?.url && (
                      <>
                        <a
                          href={formatFileUrl(certificate.file.url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="admin-btn admin-btn--small admin-btn--link"
                        >
                          View File
                        </a>
                        <a
                          href={formatFileUrl(`/api/upload/certificate/${encodeURIComponent(certificate.file.filename || (certificate.file.url || '').split('/').pop() || '')}`)}
                          download={certificate.file.originalName || 'certificate'}
                          className="admin-btn admin-btn--small admin-btn--secondary"
                        >
                          Download
                        </a>
                      </>
                    )}
                    <button 
                      onClick={() => handleEdit(certificate)}
                      className="admin-btn admin-btn--small admin-btn--secondary"
                      disabled={loading}
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(certificate._id)}
                      className="admin-btn admin-btn--small admin-btn--danger"
                      disabled={loading}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CertificatesManager;
