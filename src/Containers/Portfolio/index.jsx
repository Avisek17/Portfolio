import React, { useState, useEffect } from "react";
import { projectsAPI } from '../../services/api';
import './styles.scss';

const Portfolio = () => {
  const [portfolioData, setPortfolioData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const response = await projectsAPI.getAll();
      console.log('Projects API Response:', response); // Debug log
      
      if (response.status === 'success') {
        // Handle the nested structure from projects API
        const projectsArray = response.data.projects || response.data || [];
        console.log('Projects Array:', projectsArray); // Debug log
        
        if (projectsArray.length > 0) {
          setPortfolioData(projectsArray);
        } else {
          setPortfolioData([]);
        }
      } else {
        // No projects available
        setPortfolioData([]);
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
      setError('Failed to load projects');
      // No fallback data - admin needs to add projects
      setPortfolioData([]);
    }
    setLoading(false);
  };

  return (
    <section className="portfolio">
      <div className="portfolio__container">
        <h2 className="portfolio__title">My Portfolio</h2>
        <p className="portfolio__subtitle">Here are some of my recent projects</p>
        
        <div className="portfolio__grid">
          {portfolioData.map((project) => (
            <div key={project._id || project.id} className="portfolio__card">
              {(project.images?.thumbnail || project.image) && (
                <img 
                  src={project.images?.thumbnail || project.image} 
                  alt={project.title} 
                  className="portfolio__card-image" 
                />
              )}
              <div className="portfolio__card-content">
                <div className="portfolio__card-header">
                  <h3 className="portfolio__card-title">{project.title}</h3>
                  {project.featured && (
                    <span className="portfolio__featured-badge">Featured</span>
                  )}
                </div>
                <p className="portfolio__card-description">{project.description}</p>
                
                <div className="portfolio__technologies">
                  {project.technologies && project.technologies.map((tech, index) => (
                    <span key={index} className="portfolio__tech-tag">
                      {tech}
                    </span>
                  ))}
                </div>
                
                <div className="portfolio__card-buttons">
                  {/* Show Live Demo button only if live/demo link exists */}
                  {(project.links?.live || project.links?.demo || project.demoLink) && (
                    <a 
                      href={project.links?.live || project.links?.demo || project.demoLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="portfolio__btn portfolio__btn--demo"
                    >
                      Live Demo
                    </a>
                  )}
                  
                  {/* Show View Code button only if github link exists */}
                  {(project.links?.github || project.codeLink) && (
                    <a 
                      href={project.links?.github || project.codeLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="portfolio__btn portfolio__btn--code"
                    >
                      View Code
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {portfolioData.length === 0 && (
          <div className="portfolio__empty">
            <p>No projects available. Please add projects through the admin panel.</p>
            <a href="/admin" className="portfolio__admin-link">Go to Admin Panel</a>
          </div>
        )}
      </div>
    </section>
  );
};

export default Portfolio;