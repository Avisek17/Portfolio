import React, { useEffect, useState } from 'react';
import { profileAPI, formatImageUrl, uploadAPI } from '../../services/api';
import './styles.scss';

const Resume = () => {
  const [profile, setProfile] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await profileAPI.get();
        if (res.status === 'success') setProfile(res.data);
        // Load list of uploaded resumes
        try {
          const listRes = await uploadAPI.getResume();
          if (listRes.status === 'success' && Array.isArray(listRes.data)) {
            setResumes(listRes.data);
          }
        } catch (err) {
          console.error('Failed to load resume list', err);
        }
      } catch (err) {
        console.error('Failed to load profile for resume page', err);
      }
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <section className="resume">
        <div className="resume__container">
          <div className="loading">Loading resume...</div>
        </div>
      </section>
    );
  }

  return (
    <section className="resume">
      <div className="resume__container">
        <h2 className="resume__title">Resume & CV</h2>
        <p className="resume__subtitle">My professional documents and career highlights</p>
        
        <div className="resume__grid">
          {resumes.length > 0 ? (
            resumes.map((resume, index) => (
              <div key={resume._id || resume.filename || index} className="resume__card">
                <div className="resume__card-icon">
                  📄
                </div>
                <div className="resume__card-content">
                  <div className="resume__card-header">
                    <h3 className="resume__card-title">
                      {resume.title || resume.filename || `Resume ${index + 1}`}
                    </h3>
                    {resume.featured && (
                      <span className="resume__featured-badge">Latest</span>
                    )}
                  </div>
                  {resume.designation && (
                    <p className="resume__card-designation">{resume.designation}</p>
                  )}
                  {resume.description && (
                    <p className="resume__card-description">{resume.description}</p>
                  )}
                  
                  <div className="resume__card-meta">
                    <span className="resume__card-type">PDF Document</span>
                    {resume.uploadDate && (
                      <span className="resume__card-date">
                        {new Date(resume.uploadDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  
                  <div className="resume__card-buttons">
                    <a 
                      href={formatImageUrl(resume.url)} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="resume__btn resume__btn--view"
                    >
                      View Resume
                    </a>
                    <a 
                      href={formatImageUrl(`/api/upload/resume/file/${encodeURIComponent(resume.filename || (resume.url || '').split('/').pop() || 'resume.pdf')}`)} 
                      download={resume.filename || 'resume.pdf'}
                      className="resume__btn resume__btn--download"
                    >
                      Download
                    </a>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="resume__empty">
              <p>No resume documents available yet.</p>
              <a href="/admin" className="resume__admin-link">Upload through Admin Panel</a>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Resume;