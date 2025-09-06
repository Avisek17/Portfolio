import React, { useState, useEffect } from 'react';
import { projectsAPI } from '../../services/api';

const ProjectsManager = () => {
  const [projects, setProjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    shortDescription: '',
    technologies: '',
    category: 'web',
    status: 'completed',
    featured: false,
    priority: 0,
    links: {
      github: '',
      demo: '',
      live: ''
    },
    images: {
      thumbnail: '',
      gallery: []
    }
  });

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    setError('');
    try {
      // Use admin endpoint to get all projects (including non-public ones)
      const response = await projectsAPI.getAllAdmin();
      console.log('Projects API Response:', response); // Debug log
      
      if (response.status === 'success') {
        // Handle the nested structure from portfolio API
        const projectsArray = response.data.projects || response.data || [];
        console.log('Projects Array:', projectsArray); // Debug log
        setProjects(Array.isArray(projectsArray) ? projectsArray : []);
      } else {
        setProjects([]);
        setError('Failed to load projects: Invalid response');
      }
    } catch (error) {
      console.error('Load Projects Error:', error); // Debug log
      setError('Failed to load projects: ' + error.message);
      setProjects([]); // Ensure projects is always an array
    }
    setLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const projectData = {
      ...formData,
      technologies: formData.technologies.split(',').map(tech => tech.trim())
    };

    try {
      let response;
      if (editingProject) {
        response = await projectsAPI.update(editingProject._id, projectData);
      } else {
        response = await projectsAPI.create(projectData);
      }

      if (response.status === 'success') {
        await loadProjects(); // Reload projects
        resetForm();
        setShowForm(false); // Close the form after successful submission
        // Show success message
        setTimeout(() => {
          alert(`Project ${editingProject ? 'updated' : 'created'} successfully!`);
        }, 300);
      }
    } catch (error) {
      setError('Failed to save project: ' + error.message);
    }
    setLoading(false);
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setFormData({
      title: project.title,
      description: project.description,
      shortDescription: project.shortDescription || '',
      technologies: project.technologies.join(', '),
      category: project.category || 'web',
      status: project.status || 'completed',
      featured: project.featured || false,
      priority: project.priority || 0,
      links: {
        github: project.links?.github || '',
        demo: project.links?.demo || '',
        live: project.links?.live || ''
      },
      images: {
        thumbnail: project.images?.thumbnail || '',
        gallery: project.images?.gallery || []
      }
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      setLoading(true);
      try {
        const response = await projectsAPI.delete(id);
        if (response.status === 'success') {
          await loadProjects(); // Reload projects
        }
      } catch (error) {
        setError('Failed to delete project: ' + error.message);
      }
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      shortDescription: '',
      technologies: '',
      category: 'web',
      status: 'completed',
      featured: false,
      priority: 0,
      links: {
        github: '',
        demo: '',
        live: ''
      },
      images: {
        thumbnail: '',
        gallery: []
      }
    });
    setEditingProject(null);
    setShowForm(false);
    setError('');
  };

  if (loading && !showForm) {
    return <div className="admin-loading">Loading projects...</div>;
  }

  return (
    <div className="projects-manager admin-page">
      {/* Page Header */}
      <div className="admin-page__header">
        <div className="admin-page__header-content">
          <h1 className="admin-page__title">Projects Manager</h1>
          <p className="admin-page__subtitle">Manage your portfolio projects and showcase your work</p>
        </div>
        <div className="admin-page__actions">
          <button 
            className="admin-btn admin-btn--primary"
            onClick={() => setShowForm(true)}
            disabled={loading}
          >
            <span className="admin-btn__icon">➕</span>
            Add New Project
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

      {/* Add/Edit Form Section */}
      {showForm && (
        <div className="admin-form-section">
          <div className="admin-form-container">
            <div className="admin-form-header">
              <h2>{editingProject ? 'Edit Project' : 'Add New Project'}</h2>
              <button 
                className="admin-btn admin-btn--secondary"
                onClick={resetForm}
              >
                <span className="admin-btn__icon">✕</span>
                Cancel
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className={`admin-form ${loading ? 'admin-form--loading' : ''}`}>
              <div className="admin-form__row">
                <div className="admin-form__field">
                  <label>Project Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
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
                  required
                />
              </div>
              
              <div className="admin-form__field">
                <label>Short Description</label>
                <textarea
                  name="shortDescription"
                  value={formData.shortDescription}
                  onChange={handleInputChange}
                  rows="2"
                  required
                  placeholder="Brief description for previews"
                />
              </div>
              
              <div className="admin-form__field">
                <label>Technologies (comma separated)</label>
                <input
                  type="text"
                  name="technologies"
                  value={formData.technologies}
                  onChange={handleInputChange}
                  placeholder="React, Node.js, MongoDB"
                  required
                />
              </div>
              
              <div className="admin-form__row">
                <div className="admin-form__field">
                  <label>Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="web">Web</option>
                    <option value="mobile">Mobile</option>
                    <option value="desktop">Desktop</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div className="admin-form__field">
                  <label>Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="completed">Completed</option>
                    <option value="in-progress">In Progress</option>
                    <option value="planned">Planned</option>
                  </select>
                </div>
              </div>
              
              <div className="admin-form__field">
                <label>Priority (0-10)</label>
                <input
                  type="number"
                  name="priority"
                  min="0"
                  max="10"
                  value={formData.priority}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="admin-form__row">
                <div className="admin-form__field">
                  <label>GitHub Link</label>
                  <input
                    type="url"
                    name="links.github"
                    value={formData.links.github}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      links: { ...prev.links, github: e.target.value }
                    }))}
                  />
                </div>
                
                <div className="admin-form__field">
                  <label>Demo Link</label>
                  <input
                    type="url"
                    name="links.demo"
                    value={formData.links.demo}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      links: { ...prev.links, demo: e.target.value }
                    }))}
                  />
                </div>
              </div>
              
              <div className="admin-form__field">
                <label>Live Site Link</label>
                <input
                  type="url"
                  name="links.live"
                  value={formData.links.live}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    links: { ...prev.links, live: e.target.value }
                  }))}
                />
              </div>
              
              <div className="admin-form__field">
                <label>Thumbnail Image URL</label>
                <input
                  type="url"
                  name="images.thumbnail"
                  value={formData.images.thumbnail}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    images: { ...prev.images, thumbnail: e.target.value }
                  }))}
                />
              </div>
              
              <div className="admin-form__field">
                <label className="admin-checkbox">
                  <input
                    type="checkbox"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleInputChange}
                  />
                  Featured Project
                </label>
              </div>
              
              <div className="admin-form__actions">
                <button type="button" onClick={resetForm} className="admin-btn admin-btn--secondary">
                  Cancel
                </button>
                <button type="submit" className="admin-btn admin-btn--primary">
                  {editingProject ? 'Update' : 'Create'} Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="projects-manager__list">
        {!Array.isArray(projects) || projects.length === 0 ? (
          <div className="admin-empty">
            <p>No projects yet. Add your first project!</p>
            {error && <p className="admin-error">{error}</p>}
          </div>
        ) : (
          <div className="admin-grid">
            {projects.map((project) => (
              <div key={project._id} className="project-card">
                {project.image && (
                  <img src={project.image} alt={project.title} className="project-card__image" />
                )}
                <div className="project-card__content">
                  <h3 className="project-card__title">{project.title}</h3>
                  {project.featured && (
                    <span className="project-card__badge">Featured</span>
                  )}
                  <p className="project-card__description">{project.description}</p>
                  <div className="project-card__technologies">
                    {project.technologies.map((tech, index) => (
                      <span key={index} className="project-card__tech">{tech}</span>
                    ))}
                  </div>
                  <div className="project-card__actions">
                    <button 
                      onClick={() => handleEdit(project)}
                      className="admin-btn admin-btn--small admin-btn--secondary"
                      disabled={loading}
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(project._id)}
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

export default ProjectsManager;
