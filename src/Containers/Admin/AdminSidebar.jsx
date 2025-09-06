import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FaChartBar,
  FaProjectDiagram,
  FaBolt,
  FaTrophy,
  FaUser,
  FaFileAlt,
  FaEnvelope,
  FaSignOutAlt,
} from 'react-icons/fa';

const AdminSidebar = ({ onLogout, isOpen, onClose }) => {
  const location = useLocation();

  const menuItems = [
    {
      path: '/admin',
      icon: <FaChartBar />,
      label: 'Dashboard',
      shortLabel: 'Dash',
      color: '#ff6b6b',
      description: 'Overview & Analytics',
      badge: null,
    },
    {
      path: '/admin/projects',
      icon: <FaProjectDiagram />,
      label: 'Projects',
      shortLabel: 'Work',
      color: '#4ecdc4',
      description: 'Portfolio Showcase',
      badge: null,
    },
    {
      path: '/admin/skills',
      icon: <FaBolt />,
      label: 'Skills',
      shortLabel: 'Tech',
      color: '#45b7d1',
      description: 'Technical Expertise',
      badge: null,
    },
    {
      path: '/admin/certificates',
      icon: <FaTrophy />,
      label: 'Certificates',
      shortLabel: 'Certs',
      color: '#96ceb4',
      description: 'Achievements',
      badge: null,
    },
    {
      path: '/admin/profile',
      icon: <FaUser />,
      label: 'Profile',
      shortLabel: 'User',
      color: '#feca57',
      description: 'Personal Information',
      badge: null,
    },
    {
      path: '/admin/resumes',
      icon: <FaFileAlt />,
      label: 'Resumes',
      shortLabel: 'CV',
      color: '#a55eea',
      description: 'CV Management',
      badge: null,
    },
    {
      path: '/admin/messages',
      icon: <FaEnvelope />,
      label: 'Messages',
      shortLabel: 'Mail',
      color: '#ff9ff3',
      description: 'Contact Inquiries',
      badge: '3',
    },
  ];

  const handleLinkClick = () => {
    if (onClose) onClose();
  };

  return (
    <aside className={`admin-sidebar ${isOpen ? 'admin-sidebar--open' : ''}`}>
      {/* Sidebar Header */}
      <div className="admin-sidebar__header">
        <div className="admin-sidebar__brand">
          <div className="admin-sidebar__logo">
            <span className="admin-sidebar__logo-icon" aria-hidden="true"><FaBolt /></span>
            <div className="admin-sidebar__logo-pulse"></div>
          </div>
          <div className="admin-sidebar__brand-text">
            <h2 className="admin-sidebar__title">Portfolio</h2>
            <p className="admin-sidebar__subtitle">Admin Panel</p>
          </div>
        </div>
      </div>

     

      {/* Navigation */}
      <nav className="admin-sidebar__nav" role="navigation" aria-label="Admin navigation">
        <div className="admin-sidebar__nav-header">
          <span className="admin-sidebar__nav-title">Navigation</span>
          <div className="admin-sidebar__nav-line"></div>
        </div>

        <div className="admin-sidebar__nav-list">
          {menuItems.map((item, index) => (
            <Link
              key={item.path}
              to={item.path}
              className={`admin-sidebar__link ${
                location.pathname === item.path ? 'admin-sidebar__link--active' : ''
              }`}
              onClick={handleLinkClick}
              style={{ '--item-color': item.color, '--animation-delay': `${index * 0.05}s` }}
              title={`${item.label} — ${item.description}`}
              aria-current={location.pathname === item.path ? 'page' : undefined}
            >
              <div className="admin-sidebar__link-background"></div>

              <div className="admin-sidebar__link-content">
                <div className="admin-sidebar__link-icon-wrapper">
                  <span className="admin-sidebar__link-icon">{item.icon}</span>
                  {item.badge && <span className="admin-sidebar__link-badge">{item.badge}</span>}
                </div>

                <div className="admin-sidebar__link-text">
                  <span className="admin-sidebar__link-label">{item.label}</span>
                  <span className="admin-sidebar__link-description">{item.description}</span>
                </div>
              </div>

              <div className="admin-sidebar__link-indicator"></div>
            </Link>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="admin-sidebar__footer">
        <div className="admin-sidebar__footer-divider"></div>

        <button
          onClick={onLogout}
          className="admin-sidebar__logout"
          title="Sign Out"
          aria-label="Sign out"
        >
          <div className="admin-sidebar__logout-icon-wrapper">
            <span className="admin-sidebar__logout-icon" aria-hidden="true"><FaSignOutAlt /></span>
          </div>
          <span className="admin-sidebar__logout-label">Sign Out</span>
          <div className="admin-sidebar__logout-indicator"></div>
        </button>
  
        </div>
   
    </aside>
  );
};

export default AdminSidebar;
