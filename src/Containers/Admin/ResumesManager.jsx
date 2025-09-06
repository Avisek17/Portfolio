import React, { useEffect, useState } from 'react';
import { uploadAPI } from '../../services/api';

const ResumesManager = () => {
  const [resumes, setResumes] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDesignation, setUploadDesignation] = useState('');
  // New: hold selected file until user clicks Save
  const [selectedFile, setSelectedFile] = useState(null);

  const loadResumes = async () => {
    try {
      const res = await uploadAPI.getResume();
      if (res.status === 'success') setResumes(res.data || []);
    } catch (err) {
      console.error('Failed to load resumes', err);
    }
  };

  useEffect(() => {
    loadResumes();
  }, []);

  // Read token at render-time to decide UI state
  const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;

  // Replace immediate upload on file select with file selection only
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    setError('');
  };

  // New: explicit Save action to upload the selected file + metadata
  const handleSave = async () => {
    if (!selectedFile) {
      setError('Please select a file to upload.');
      return;
    }
    if (!token) {
      setError('You must be logged in as admin to upload resumes.');
      return;
    }

    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('resume', selectedFile);
      if (uploadTitle) formData.append('title', uploadTitle);
      if (uploadDesignation) formData.append('designation', uploadDesignation);

      const res = await uploadAPI.uploadResume(formData);
      if (res.status === 'success') {
        setSuccess('Uploaded successfully');
        setSelectedFile(null);
        setUploadTitle('');
        setUploadDesignation('');
        await loadResumes();
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Upload failed');
    }
    setUploading(false);
    setTimeout(() => setSuccess(''), 3000);
  };

  // Allow cancelling selected file
  const handleCancelSelection = () => {
    setSelectedFile(null);
    setError('');
  };

  const handleDelete = async (filename) => {
    const confirmed = window.confirm('Delete this resume?');
    if (!confirmed) return;
    try {
      const res = await uploadAPI.deleteResume(filename);
      if (res.status === 'success') {
        await loadResumes();
      }
    } catch (err) {
      console.error('Delete failed', err);
      setError('Delete failed');
    }
  };

  return (
    <div className="resumes-manager admin-page">
      <div className="admin-page__header">
        <div className="admin-page__header-content">
          <h1 className="admin-page__title">Resumes Manager</h1>
          <p className="admin-page__subtitle">Upload and manage resumes/CVs</p>
        </div>
      </div>

      <div className="admin-form">
        <div className="admin-form__field">
          <label>Upload Resume</label>
          <input type="text" placeholder="Title (e.g., Senior Backend Engineer CV)" value={uploadTitle} onChange={(e) => setUploadTitle(e.target.value)} />
          <input type="text" placeholder="Designation (e.g., Backend Developer)" value={uploadDesignation} onChange={(e) => setUploadDesignation(e.target.value)} />

          {!token && (
            <div className="admin-error" style={{ marginBottom: '8px' }}>
              Please log in to upload resumes.
            </div>
          )}

          {/* File select (does not upload immediately) */}
          <input
            type="file"
            accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png,image/gif"
            onChange={handleFileSelect}
            disabled={!token || uploading}
          />

          {/* Show selected file name and action buttons */}
          {selectedFile && (
            <div style={{ marginTop: 8 }}>
              <div><strong>Selected:</strong> {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)</div>
              <div style={{ marginTop: 6 }}>
                <button type="button" className="admin-btn" onClick={handleSave} disabled={uploading}>Save</button>
                <button type="button" className="admin-btn admin-btn--ghost" onClick={handleCancelSelection} disabled={uploading} style={{ marginLeft: 8 }}>Cancel</button>
              </div>
            </div>
          )}

          {uploading && <div>Uploading...</div>}
          {success && <div className="admin-success">{success}</div>}
          {error && <div className="admin-error">{error}</div>}
        </div>

        <div className="resumes-list">
          <h3>Uploaded Resumes</h3>
          {resumes.length === 0 && <p>No resumes uploaded yet.</p>}
          <ul>
            {resumes.map(r => (
              <li key={r._id}>
                <strong>{r.title || r.filename}</strong>
                {r.designation && <span> — {r.designation}</span>}
                {' '}
                <a href={r.url} target="_blank" rel="noopener noreferrer">View</a>
                {' '}
                <a href={r.url} download>Download</a>
                {' '}
                <button onClick={() => handleDelete(r.filename)}>Delete</button>
              </li>
            ))}
           </ul>
         </div>
       </div>
     </div>
   );
 };
 
 export default ResumesManager;
