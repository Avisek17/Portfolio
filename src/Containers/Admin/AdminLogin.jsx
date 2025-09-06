import React, { useState } from 'react';
import { authAPI } from '../../services/api';

const AdminLogin = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authAPI.login(credentials);
      
      if (response.status === 'success') {
        // Store token in localStorage
        localStorage.setItem('adminToken', response.data.token);
        localStorage.setItem('adminData', JSON.stringify(response.data.admin));
        
        // Call onLogin with token
        onLogin(response.data.token);
      }
    } catch (error) {
      setError(error.message || 'Login failed. Please try again.');
    }
    
    setLoading(false);
  };

  return (
    <div className="admin-login">
      <div className="admin-login__container">
        <div className="admin-login__header">
          <h1 className="admin-login__title">Portfolio Admin</h1>
          <p className="admin-login__subtitle">Sign in to manage your portfolio</p>
        </div>
        
        <form className="admin-login__form" onSubmit={handleSubmit}>
          {error && (
            <div className="admin-login__error">
              {error}
            </div>
          )}
          
          <div className="admin-login__field">
            <label className="admin-login__label">Username</label>
            <input
              type="text"
              name="username"
              value={credentials.username}
              onChange={handleChange}
              className="admin-login__input"
              placeholder="Enter username"
              required
            />
          </div>
          
          <div className="admin-login__field">
            <label className="admin-login__label">Password</label>
            <input
              type="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              className="admin-login__input"
              placeholder="Enter password"
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="admin-login__button"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        
  {/* Footer intentionally left minimal to avoid exposing demo credentials */}
      </div>
    </div>
  );
};

export default AdminLogin;
