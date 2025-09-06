import React, { useState, useEffect } from 'react';
import { profileAPI } from '../../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    projects: 0,
    skills: 0,
    certificates: 0,
    contactMessages: 0,
    lastUpdated: new Date().toLocaleDateString(),
    profileCompletion: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load stats from localStorage and API
      const projects = JSON.parse(localStorage.getItem('portfolioProjects') || '[]');
      const skills = JSON.parse(localStorage.getItem('portfolioSkills') || '[]');
      const certificates = JSON.parse(localStorage.getItem('portfolioCertificates') || '[]');
      const messages = JSON.parse(localStorage.getItem('contactMessages') || '[]');
      
      // Calculate profile completion
      let profileCompletion = 0;
      try {
        const response = await profileAPI.get();
        if (response.status === 'success' && response.data) {
          const profile = response.data;
          const fields = ['name', 'title', 'bio', 'email', 'phone', 'location'];
          const completedFields = fields.filter(field => profile[field] && profile[field].trim());
          profileCompletion = Math.round((completedFields.length / fields.length) * 100);
        }
      } catch (error) {
        console.error('Failed to load profile for completion:', error);
      }
      
      setStats({
        projects: projects.length,
        skills: skills.length,
        certificates: certificates.length,
        contactMessages: messages.length,
        lastUpdated: new Date().toLocaleDateString(),
        profileCompletion
      });

      // Set recent activity
      setRecentActivity([
        { icon: '💼', text: `${projects.length} projects in portfolio`, time: '2 hours ago', type: 'projects' },
        { icon: '🛠️', text: `${skills.length} skills listed`, time: '1 day ago', type: 'skills' },
        { icon: '🏆', text: `${certificates.length} certificates added`, time: '3 days ago', type: 'certificates' },
        { icon: '📧', text: `${messages.length} contact messages`, time: '1 week ago', type: 'messages' }
      ].filter(item => !item.text.startsWith('0')));
      
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
    setLoading(false);
  };

  const quickActions = [
    { 
      title: 'Add New Project', 
      path: '/admin/projects', 
      icon: '🚀', 
      color: 'coral', 
      description: 'Showcase your work',
      gradient: 'linear-gradient(135deg, #ff6b6b 0%, #ff8787 100%)'
    },
    { 
      title: 'Manage Skills', 
      path: '/admin/skills', 
      icon: '⚡', 
      color: 'teal', 
      description: 'Update your expertise',
      gradient: 'linear-gradient(135deg, #4ecdc4 0%, #44b3aa 100%)'
    },
    { 
      title: 'Add Certificate', 
      path: '/admin/certificates', 
      icon: '🏆', 
      color: 'blue', 
      description: 'Display achievements',
      gradient: 'linear-gradient(135deg, #45b7d1 0%, #3a9bc1 100%)'
    },
    { 
      title: 'Edit Profile', 
      path: '/admin/profile', 
      icon: '👤', 
      color: 'mint', 
      description: 'Update personal info',
      gradient: 'linear-gradient(135deg, #96ceb4 0%, #85c7a3 100%)'
    },
    { 
      title: 'View Portfolio', 
      path: '/', 
      icon: '🌐', 
      color: 'purple', 
      description: 'See public portfolio',
      gradient: 'linear-gradient(135deg, #a55eea 0%, #9742d8 100%)'
    },
    { 
      title: 'Contact Messages', 
      path: '/admin/contacts', 
      icon: '📬', 
      color: 'orange', 
      description: 'Review inquiries',
      gradient: 'linear-gradient(135deg, #ffa726 0%, #ff9800 100%)'
    }
  ];

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return 'var(--accent-color)';
    if (percentage >= 60) return 'var(--accent-color-2)';
    if (percentage >= 40) return 'var(--accent-color-3)';
    return '#ffa726';
  };

  return (
    <div className="admin-dashboard">
      {loading && (
        <div className="admin-dashboard__loading">
          <div className="loading-spinner"></div>
          <p>Loading dashboard data...</p>
        </div>
      )}
      
      <div className="admin-dashboard__header">
        <div className="admin-dashboard__welcome">
          <h1 className="admin-dashboard__title">
            <span className="admin-dashboard__greeting">Welcome back!</span>
            <span className="admin-dashboard__subtitle">Portfolio Dashboard</span>
          </h1>
          <p className="admin-dashboard__description">
            Manage your portfolio content and track your progress
          </p>
        </div>
        <div className="admin-dashboard__date">
          <div className="admin-dashboard__date-card">
            <span className="admin-dashboard__date-label">Today</span>
            <span className="admin-dashboard__date-value">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
          </div>
        </div>
      </div>

      <div className="admin-dashboard__overview">
        <div className="admin-dashboard__stats">
          <div className="admin-stat admin-stat--projects">
            <div className="admin-stat__background"></div>
            <div className="admin-stat__content">
              <div className="admin-stat__icon">💼</div>
              <div className="admin-stat__info">
                <h3 className="admin-stat__number">{stats.projects}</h3>
                <p className="admin-stat__label">Projects</p>
              </div>
            </div>
            <div className="admin-stat__trend">
              <span className="admin-stat__trend-icon">📈</span>
            </div>
          </div>
          
          <div className="admin-stat admin-stat--skills">
            <div className="admin-stat__background"></div>
            <div className="admin-stat__content">
              <div className="admin-stat__icon">⚡</div>
              <div className="admin-stat__info">
                <h3 className="admin-stat__number">{stats.skills}</h3>
                <p className="admin-stat__label">Skills</p>
              </div>
            </div>
            <div className="admin-stat__trend">
              <span className="admin-stat__trend-icon">🔥</span>
            </div>
          </div>
          
          <div className="admin-stat admin-stat--certificates">
            <div className="admin-stat__background"></div>
            <div className="admin-stat__content">
              <div className="admin-stat__icon">🏆</div>
              <div className="admin-stat__info">
                <h3 className="admin-stat__number">{stats.certificates}</h3>
                <p className="admin-stat__label">Certificates</p>
              </div>
            </div>
            <div className="admin-stat__trend">
              <span className="admin-stat__trend-icon">⭐</span>
            </div>
          </div>
          
          <div className="admin-stat admin-stat--messages">
            <div className="admin-stat__background"></div>
            <div className="admin-stat__content">
              <div className="admin-stat__icon">📬</div>
              <div className="admin-stat__info">
                <h3 className="admin-stat__number">{stats.contactMessages}</h3>
                <p className="admin-stat__label">Messages</p>
              </div>
            </div>
            <div className="admin-stat__trend">
              <span className="admin-stat__trend-icon">💬</span>
            </div>
          </div>
        </div>

        <div className="admin-dashboard__progress">
          <div className="admin-progress-card">
            <div className="admin-progress-card__header">
              <h3 className="admin-progress-card__title">Profile Completion</h3>
              <span className="admin-progress-card__percentage">{stats.profileCompletion}%</span>
            </div>
            <div className="admin-progress-card__bar">
              <div 
                className="admin-progress-card__fill" 
                style={{ 
                  width: `${stats.profileCompletion}%`,
                  background: getProgressColor(stats.profileCompletion)
                }}
              ></div>
            </div>
            <p className="admin-progress-card__description">
              {stats.profileCompletion === 100 
                ? "🎉 Your profile is complete!" 
                : stats.profileCompletion >= 80 
                ? "Almost there! A few more details needed." 
                : "Add more information to improve your profile."}
            </p>
          </div>
        </div>
      </div>

      <div className="admin-dashboard__actions">
        <h2 className="admin-dashboard__section-title">
          <span className="admin-dashboard__section-icon">⚡</span>
          Quick Actions
        </h2>
        <div className="admin-dashboard__quick-actions">
          {quickActions.map((action, index) => (
            <a
              key={index}
              href={action.path}
              className={`admin-quick-action admin-quick-action--${action.color}`}
              style={{ '--action-gradient': action.gradient }}
            >
              <div className="admin-quick-action__background"></div>
              <div className="admin-quick-action__content">
                <div className="admin-quick-action__icon">{action.icon}</div>
                <div className="admin-quick-action__info">
                  <h3 className="admin-quick-action__title">{action.title}</h3>
                  <p className="admin-quick-action__description">{action.description}</p>
                </div>
              </div>
              <div className="admin-quick-action__arrow">→</div>
            </a>
          ))}
        </div>
      </div>

      <div className="admin-dashboard__recent">
        <h2 className="admin-dashboard__section-title">
          <span className="admin-dashboard__section-icon">📈</span>
          Recent Activity
        </h2>
        <div className="admin-activity">
          {recentActivity.length > 0 ? (
            recentActivity.map((activity, index) => (
              <div key={index} className={`admin-activity__item admin-activity__item--${activity.type}`}>
                <span className="admin-activity__icon">{activity.icon}</span>
                <div className="admin-activity__content">
                  <span className="admin-activity__text">{activity.text}</span>
                  <span className="admin-activity__time">{activity.time}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="admin-activity__empty">
              <span className="admin-activity__empty-icon">🌟</span>
              <p>Start adding content to see your activity here!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
