import React, { useState, useEffect } from "react";
import { skillsAPI, certificatesAPI, formatFileUrl, formatImageUrl } from '../../services/api';
import './styles.scss';

const Skills = () => {
  const [skillCategories, setSkillCategories] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    await Promise.all([loadSkills(), loadCertificates()]);
    setLoading(false);
  };

  const loadSkills = async () => {
    try {
      const response = await skillsAPI.getAll();
      console.log('Skills API Response:', response); // Debug log
      
      if (response.status === 'success') {
        // Handle the nested structure from skills API
        const skillsArray = response.data.skills || response.data || [];
        console.log('Skills Array:', skillsArray); // Debug log
        
        if (skillsArray.length > 0) {
          // Group skills by category
          const grouped = skillsArray.reduce((acc, skill) => {
            const category = skill.category || 'Others';
            if (!acc[category]) {
              acc[category] = [];
            }
            acc[category].push({
              name: skill.name,
              icon: skill.icon || '⚡',
              level: skill.proficiency ? `${skill.proficiency}%` : 'Intermediate',
              proficiency: skill.proficiency || 50,
              yearsOfExperience: skill.yearsOfExperience || 1
            });
            return acc;
          }, {});

          // Convert to array format
          const categoriesArray = Object.entries(grouped).map(([title, skills]) => ({
            title,
            skills
          }));
          
          setSkillCategories(categoriesArray);
        } else {
          setSkillCategories([]);
        }
      } else {
        // No skills data available
        setSkillCategories([]);
      }
    } catch (error) {
      console.error('Failed to load skills:', error);
      // No fallback data - admin needs to add skills
      setSkillCategories([]);
    }
  };

  const loadCertificates = async () => {
    try {
      const response = await certificatesAPI.getAll();
      console.log('Certificates API Response:', response); // Debug log
      
      if (response.status === 'success') {
        // Handle the nested structure from certificates API
        const certificatesArray = response.data.certificates || response.data || [];
        console.log('Certificates Array:', certificatesArray); // Debug log
        
        // Show certificates that are featured, have images, or have attached files
        const displayCertificates = certificatesArray.filter(cert => 
          cert.featured || (cert.image && cert.image.url) || (cert.file && cert.file.url)
        );
        
        setCertificates(displayCertificates);
      } else {
        setCertificates([]);
      }
    } catch (error) {
      console.error('Failed to load certificates:', error);
      setCertificates([]);
    }
  };

  const getLevelColor = (level) => {
    switch (level) {
      case "Expert": return "expert";
      case "Advanced": return "advanced";
      case "Intermediate": return "intermediate";
      default: return "beginner";
    }
  };

  if (loading) {
    return (
      <section className="skills">
        <div className="skills__container">
          <div className="loading">Loading skills...</div>
        </div>
      </section>
    );
  }

  return (
    <section className="skills">
      <div className="skills__container">
        <h2 className="skills__title">My Skills & Expertise</h2>
        <p className="skills__subtitle">Technologies, tools, and certifications that power my development journey</p>
        
        {skillCategories.length > 0 ? (
          <>
            <div className="skills__grid">
              {skillCategories.map((category, categoryIndex) => (
                <div key={categoryIndex} className="skills__card">
                  <div className="skills__card-header">
                    <h3 className="skills__card-title">{category.title}</h3>
                    <span className="skills__card-count">{category.skills.length} Skills</span>
                  </div>
                  <div className="skills__card-content">
                    {category.skills.map((skill, skillIndex) => (
                      <div key={skillIndex} className="skills__skill-item">
                        <div className="skills__skill-header">
                          <span className="skills__skill-icon">{skill.icon}</span>
                          <span className="skills__skill-name">{skill.name}</span>
                          <span className={`skills__skill-level skills__skill-level--${getLevelColor(skill.level)}`}>
                            {skill.proficiency}%
                          </span>
                        </div>
                        <div className="skills__skill-bar">
                          <div 
                            className="skills__skill-progress" 
                            style={{ width: `${skill.proficiency || 50}%` }}
                          ></div>
                        </div>
                        {skill.yearsOfExperience && (
                          <div className="skills__skill-experience">
                            {skill.yearsOfExperience} {skill.yearsOfExperience === 1 ? 'year' : 'years'} experience
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Certificates Section */}
            {certificates.length > 0 && (
              <div className="skills__certificates">
                <h3 className="skills__certificates-title">Professional Certifications</h3>
                <div className="skills__certificates-grid">
                  {certificates.map((certificate) => (
                    <div key={certificate._id} className="skills__certificate-card">
                      {certificate.image?.url && (
                        <div className="skills__certificate-image">
                          <img 
                            src={formatImageUrl(certificate.image.url)} 
                            alt={certificate.image.alt || certificate.title}
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
              <div className="skills__certificate-image-actions">
                            <a
                              href={formatImageUrl(certificate.image.url)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="skills__certificate-link skills__certificate-link--view"
                            >
                              View Image
                            </a>
                            <a
                              href={formatFileUrl(`/api/upload/certificate/${encodeURIComponent((certificate.image.url || '').split('/').pop() || '')}`)}
                              download={certificate.image.alt || `${certificate.title}-image`}
                              className="skills__certificate-link skills__certificate-link--download"
                            >
                              Download Image
                            </a>
                          </div>
                        </div>
                      )}
                      <div className="skills__certificate-content">
                        <div className="skills__certificate-header">
                          <h4 className="skills__certificate-title">{certificate.title}</h4>
                          {certificate.featured && (
                            <span className="skills__featured-badge">Featured</span>
                          )}
                        </div>
                        <p className="skills__certificate-issuer">{certificate.issuer}</p>
                        {certificate.description && (
                          <p className="skills__certificate-description">{certificate.description}</p>
                        )}
                        <div className="skills__certificate-meta">
                          <span className="skills__certificate-date">
                            {new Date(certificate.issueDate).getFullYear()}
                          </span>
                          {certificate.level && (
                            <span className={`skills__certificate-level skills__certificate-level--${certificate.level}`}>
                              {certificate.level}
                            </span>
                          )}
                        </div>
                        {certificate.credentialUrl && (
                          <a 
                            href={certificate.credentialUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="skills__certificate-link"
                          >
                            View Certificate
                          </a>
                        )}
                        {certificate.file?.url && (
                          <div className="skills__certificate-file">
                            <a
                              href={formatFileUrl(certificate.file.url)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="skills__certificate-link skills__certificate-link--view"
                            >
                              View File
                            </a>
                            <a
                              href={formatFileUrl(`/api/upload/certificate/${encodeURIComponent(certificate.file.filename || (certificate.file.url || '').split('/').pop() || '')}`)}
                              download={certificate.file.originalName || 'certificate'}
                              className="skills__certificate-link skills__certificate-link--download"
                            >
                              Download
                            </a>
                          </div>
                        )}
                        {/* Unified actions row with a prominent Download button (file preferred, fallback to image) */}
      <div className="skills__certificate-actions">
                          {certificate.file?.url ? (
                            <>
                              <a
                                href={formatFileUrl(certificate.file.url)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="skills__certificate-link skills__certificate-link--view"
                              >
                                View
                              </a>
                              <a
                                href={formatFileUrl(`/api/upload/certificate/${encodeURIComponent(certificate.file.filename || (certificate.file.url || '').split('/').pop() || '')}`)}
                                download={certificate.file.originalName || `${certificate.title}`}
                                className="skills__certificate-link skills__certificate-link--download"
                              >
                                Download
                              </a>
                            </>
                          ) : certificate.image?.url ? (
                            <>
                              <a
                                href={formatImageUrl(certificate.image.url)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="skills__certificate-link skills__certificate-link--view"
                              >
                                View Image
                              </a>
                              <a
                                href={formatFileUrl(`/api/upload/certificate/${encodeURIComponent((certificate.image.url || '').split('/').pop() || '')}`)}
                                download={certificate.image.alt || `${certificate.title}-image`}
                                className="skills__certificate-link skills__certificate-link--download"
                              >
                                Download
                              </a>
                            </>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="skills__empty">
            <p>No skills added yet. Building something amazing takes time!</p>
            <a href="/admin" className="skills__admin-link">Add skills through Admin Panel</a>
          </div>
        )}
      </div>
    </section>
  );
};

export default Skills;