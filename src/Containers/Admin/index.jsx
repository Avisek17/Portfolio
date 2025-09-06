import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';
import ProjectsManager from './ProjectsManager';
import SkillsManager from './SkillsManager';
import CertificatesManager from './CertificatesManager';
import ProfileManager from './ProfileManager';
import MessagesManager from './MessagesManager';
import ResumesManager from './ResumesManager';
import AdminSidebar from './AdminSidebar';
import './styles.scss';

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('adminToken');
    if (token) {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const handleLogin = (token) => {
    localStorage.setItem('adminToken', token);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAuthenticated(false);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  if (loading) {
    return <div className="admin-loading">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return (
    <div className="admin">
      {/* Mobile menu button */}
      <button 
        className="admin-mobile-toggle"
        onClick={toggleSidebar}
        aria-label="Toggle menu"
      >
        <span className={`admin-mobile-toggle__line ${sidebarOpen ? 'admin-mobile-toggle__line--open' : ''}`}></span>
        <span className={`admin-mobile-toggle__line ${sidebarOpen ? 'admin-mobile-toggle__line--open' : ''}`}></span>
        <span className={`admin-mobile-toggle__line ${sidebarOpen ? 'admin-mobile-toggle__line--open' : ''}`}></span>
      </button>
      
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="admin-overlay" 
          onClick={closeSidebar}
        ></div>
      )}
      
      <AdminSidebar 
        onLogout={handleLogout} 
        isOpen={sidebarOpen}
        onClose={closeSidebar}
      />
      <div className="admin__content">
        <Routes>
          <Route path="/" element={<AdminDashboard />} />
          <Route path="/projects" element={<ProjectsManager />} />
          <Route path="/skills" element={<SkillsManager />} />
          <Route path="/certificates" element={<CertificatesManager />} />
          <Route path="/profile" element={<ProfileManager />} />
          <Route path="/resumes" element={<ResumesManager />} />
          <Route path="/messages" element={<MessagesManager />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default Admin;
