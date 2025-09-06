import React, { useState, useEffect } from 'react';
import { skillsAPI } from '../../services/api';

const SkillsManager = () => {
  const [skills, setSkills] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    category: 'frontend',
    proficiency: 50,
    yearsOfExperience: 1,
    icon: '',
    color: '#3498db',
    description: '',
    featured: false,
    priority: 0
  });

  const categories = ['frontend', 'backend', 'database', 'tools', 'languages', 'frameworks', 'other'];

  useEffect(() => {
    loadSkills();
  }, []);

  const loadSkills = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await skillsAPI.getAll();
      console.log('Skills API Response:', response); // Debug log
      
      if (response.status === 'success') {
        // Handle the nested structure from skills API
        const skillsArray = response.data.skills || response.data || [];
        console.log('Skills Array:', skillsArray); // Debug log
        setSkills(Array.isArray(skillsArray) ? skillsArray : []);
      } else {
        setSkills([]);
        setError('Failed to load skills: Invalid response');
      }
    } catch (error) {
      console.error('Load Skills Error:', error); // Debug log
      setError('Failed to load skills: ' + error.message);
      setSkills([]); // Ensure skills is always an array
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let response;
      if (editingSkill) {
        response = await skillsAPI.update(editingSkill._id, formData);
      } else {
        response = await skillsAPI.create(formData);
      }

      if (response.status === 'success') {
        await loadSkills(); // Reload skills
        resetForm();
        setShowForm(false); // Close the form after successful submission
        // Show success message
        setTimeout(() => {
          alert(`Skill ${editingSkill ? 'updated' : 'created'} successfully!`);
        }, 300);
      }
    } catch (error) {
      setError('Failed to save skill: ' + error.message);
    }
    setLoading(false);
  };

  const handleEdit = (skill) => {
    setEditingSkill(skill);
    setFormData({
      name: skill.name,
      category: skill.category,
      proficiency: skill.proficiency || 50,
      yearsOfExperience: skill.yearsOfExperience || 1,
      icon: skill.icon || '',
      color: skill.color || '#3498db',
      description: skill.description || '',
      featured: skill.featured || false,
      priority: skill.priority || 0
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this skill?')) {
      setLoading(true);
      try {
        const response = await skillsAPI.delete(id);
        if (response.status === 'success') {
          await loadSkills(); // Reload skills
        }
      } catch (error) {
        setError('Failed to delete skill: ' + error.message);
      }
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'frontend',
      proficiency: 50,
      yearsOfExperience: 1,
      icon: '',
      color: '#3498db',
      description: '',
      featured: false,
      priority: 0
    });
    setEditingSkill(null);
    setShowForm(false);
    setError('');
  };

  const groupedSkills = Array.isArray(skills) ? skills.reduce((acc, skill) => {
    const category = skill.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(skill);
    return acc;
  }, {}) : {};

  if (loading && !showForm) {
    return <div className="admin-loading">Loading skills...</div>;
  }

  return (
    <div className="skills-manager admin-page">
      {/* Page Header */}
      <div className="admin-page__header">
        <div className="admin-page__header-content">
          <h1 className="admin-page__title">Skills Manager</h1>
          <p className="admin-page__subtitle">Manage your technical skills and expertise levels</p>
        </div>
        <div className="admin-page__actions">
          <button 
            className="admin-btn admin-btn--primary"
            onClick={() => setShowForm(true)}
            disabled={loading}
          >
            <span className="admin-btn__icon">🛠️</span>
            Add New Skill
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
              <h2>{editingSkill ? 'Edit Skill' : 'Add New Skill'}</h2>
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
                  <label>Skill Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="admin-form__field">
                  <label>Icon/Emoji</label>
                  <input
                    type="text"
                    name="icon"
                    value={formData.icon}
                    onChange={handleInputChange}
                    placeholder="⚛️"
                  />
                </div>
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
                    <option value="">Select Category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                
                <div className="admin-form__field">
                  <label>Proficiency (1-100)</label>
                  <input
                    type="number"
                    name="proficiency"
                    value={formData.proficiency}
                    onChange={handleInputChange}
                    min="1"
                    max="100"
                    required
                  />
                </div>
              </div>
              
              <div className="admin-form__row">
                <div className="admin-form__field">
                  <label>Years of Experience</label>
                  <input
                    type="number"
                    name="yearsOfExperience"
                    value={formData.yearsOfExperience}
                    onChange={handleInputChange}
                    min="0"
                    max="50"
                    required
                  />
                </div>
                
                <div className="admin-form__field">
                  <label>Icon (optional)</label>
                  <input
                    type="text"
                    name="icon"
                    value={formData.icon}
                    onChange={handleInputChange}
                    placeholder="e.g., fab fa-react"
                  />
                </div>
              </div>
              
              <div className="admin-form__row">
                <div className="admin-form__field">
                  <label>Color (optional)</label>
                  <input
                    type="color"
                    name="color"
                    value={formData.color}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="admin-form__field">
                  <label>Priority (optional)</label>
                  <input
                    type="number"
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    min="0"
                    placeholder="Higher = more important"
                  />
                </div>
              </div>
              
              <div className="admin-form__field">
                <label>Description (optional)</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Brief description of your experience with this skill"
                  rows="3"
                />
              </div>
              
              <div className="admin-form__field">
                <label className="admin-checkbox">
                  <input
                    type="checkbox"
                    name="featured"
                    checked={formData.featured}
                    onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                  />
                  Featured Skill
                </label>
              </div>
              
              <div className="admin-form__actions">
                <button type="button" onClick={resetForm} className="admin-btn admin-btn--secondary">
                  Cancel
                </button>
                <button type="submit" className="admin-btn admin-btn--primary">
                  {editingSkill ? 'Update' : 'Create'} Skill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="skills-manager__content">
        {Object.keys(groupedSkills).length === 0 ? (
          <div className="admin-empty">
            <p>No skills yet. Add your first skill!</p>
            {error && <p className="admin-error">{error}</p>}
          </div>
        ) : (
          Object.entries(groupedSkills).map(([category, categorySkills]) => (
            <div key={category} className="skills-category">
              <h2 className="skills-category__title">{category}</h2>
              <div className="skills-category__grid">
                {categorySkills.map((skill) => (
                  <div key={skill._id} className="skill-card">
                    <div className="skill-card__header">
                      <span 
                        className="skill-card__icon" 
                        style={{ color: skill.color || '#3498db' }}
                      >
                        {skill.icon || '🔧'}
                      </span>
                      <h3 className="skill-card__name">{skill.name}</h3>
                    </div>
                    <div className="skill-card__details">
                      <span className="skill-card__proficiency">
                        Proficiency: {skill.proficiency}%
                      </span>
                      <span className="skill-card__experience">
                        Experience: {skill.yearsOfExperience} year{skill.yearsOfExperience !== 1 ? 's' : ''}
                      </span>
                      {skill.description && (
                        <p className="skill-card__description">{skill.description}</p>
                      )}
                      {skill.featured && (
                        <span className="skill-card__featured">★ Featured</span>
                      )}
                    </div>
                    <div className="skill-card__actions">
                      <button 
                        onClick={() => handleEdit(skill)}
                        className="admin-btn admin-btn--small admin-btn--secondary"
                        disabled={loading}
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(skill._id)}
                        className="admin-btn admin-btn--small admin-btn--danger"
                        disabled={loading}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SkillsManager;
