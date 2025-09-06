import React, { useState, useEffect } from 'react';
import { profileAPI, authAPI } from '../../services/api';
import ImageUpload from '../../Components/ImageUpload';

const ProfileManager = () => {
  const [profileData, setProfileData] = useState({
    name: '',
    title: '',
    bio: '',
    contactDescription: '',
    email: '',
    phone: '',
    location: '',
    website: '',
    github: '',
    linkedin: '',
    twitter: '',
    instagram: '',
    profileImage: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  // Cropping toggle removed (not currently used)

  // Account & Security state (admin username + password change)
  const [account, setAccount] = useState({
    username: '',
    loading: false,
    error: '',
    success: ''
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [passwordStatus, setPasswordStatus] = useState({
    loading: false,
    error: '',
    success: ''
  });

  useEffect(() => {
    loadProfile();
    const token = localStorage.getItem('adminToken');
    if (token) {
      loadAccount();
    }
    const handleUnauthorized = () => {
      setAccount(prev => ({ ...prev, username: '', error: 'Session expired – please log in again' }));
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const response = await profileAPI.get();
      if (response.status === 'success' && response.data) {
        setProfileData(prev => ({ ...prev, ...response.data }));
      }
    } catch (error) {
      setError('Failed to load profile: ' + error.message);
    }
    setLoading(false);
  };

  const loadAccount = async () => {
    try {
      const response = await authAPI.getProfile();
      if (response.status === 'success' && response.data && response.data.admin) {
        setAccount(prev => ({ ...prev, username: response.data.admin.username }));
      }
    } catch (e) {
      // Non-blocking for main profile
      console.debug('Failed to load admin account profile', e);
    }
  };

  const saveProfile = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      // Omit resume field from profile updates (resumes managed separately)
      const payload = { ...profileData };
      if (payload.resume !== undefined) delete payload.resume;
      const response = await profileAPI.update(payload);
      if (response.status === 'success') {
        setSuccess('Profile updated successfully!');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      setError('Failed to update profile: ' + error.message);
    }
    setLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageSelect = (imageData) => {
    // Handle both string and object formats from ImageUpload component
    const imageUrl = typeof imageData === 'string' ? imageData : imageData.url;
    setProfileData(prev => ({
      ...prev,
      profileImage: imageUrl
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    saveProfile();
  };

  // Account & Security handlers
  const handleUsernameChange = (e) => {
    const val = e.target.value;
    setAccount(prev => ({ ...prev, username: val, error: '', success: '' }));
  };

  const updateUsername = async () => {
    const cleaned = (account.username || '').trim();
    // Basic client-side validation mirroring backend constraints
    if (cleaned.length < 3 || cleaned.length > 20 || !/^\w+$/.test(cleaned)) {
      setAccount(prev => ({ ...prev, error: 'Username must be 3-20 chars and use letters, numbers, or _', success: '' }));
      return;
    }
    setAccount(prev => ({ ...prev, loading: true, error: '', success: '' }));
    try {
      const res = await authAPI.updateProfile({ username: cleaned });
      if (res.status === 'success') {
        // Update localStorage adminData if present
        try {
          const adminDataRaw = localStorage.getItem('adminData');
          if (adminDataRaw) {
            const adminData = JSON.parse(adminDataRaw);
            adminData.username = cleaned;
            localStorage.setItem('adminData', JSON.stringify(adminData));
          }
        } catch {}
        setAccount(prev => ({ ...prev, success: 'Username updated successfully', error: '' }));
      }
    } catch (err) {
      setAccount(prev => ({ ...prev, error: err.message || 'Failed to update username', success: '' }));
    }
    setAccount(prev => ({ ...prev, loading: false }));
  };

  const handlePasswordInput = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
    setPasswordStatus({ loading: false, error: '', success: '' });
  };

  const changePassword = async () => {
    const { currentPassword, newPassword, confirmNewPassword } = passwordForm;
    if (!currentPassword || !newPassword) {
      setPasswordStatus({ loading: false, error: 'Please fill in all password fields', success: '' });
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordStatus({ loading: false, error: 'New passwords do not match', success: '' });
      return;
    }
    // Simple complexity check to match backend: at least 6 chars, contains lower, upper, digit
    const okLen = newPassword.length >= 6;
    const okRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+/.test(newPassword);
    if (!okLen || !okRegex) {
      setPasswordStatus({ loading: false, error: 'Password needs 6+ chars incl. lowercase, uppercase, and a number', success: '' });
      return;
    }
    setPasswordStatus({ loading: true, error: '', success: '' });
    try {
      const res = await authAPI.changePassword({ currentPassword, newPassword });
      if (res.status === 'success') {
        setPasswordStatus({ loading: false, error: '', success: 'Password changed successfully' });
        setPasswordForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
      }
    } catch (err) {
      setPasswordStatus({ loading: false, error: err.message || 'Failed to change password', success: '' });
    }
  };

  if (loading && !profileData.name) {
    return <div className="admin-loading">Loading profile...</div>;
  }

  return (
    <div className="profile-manager admin-page">
      {/* Page Header */}
      <div className="admin-page__header">
        <div className="admin-page__header-content">
          <h1 className="admin-page__title">Profile Manager</h1>
          <p className="admin-page__subtitle">Update your personal and professional information</p>
        </div>
        <div className="admin-page__actions">
          <button 
            className="admin-btn admin-btn--primary"
            onClick={saveProfile}
            disabled={loading}
          >
            <span className="admin-btn__icon">💾</span>
            {loading ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </div>

      {/* Success/Error Messages */}
      {error && (
        <div className="admin-error">
          {error}
          <button onClick={() => setError('')} className="admin-error__close">×</button>
        </div>
      )}
      
      {success && (
        <div className="admin-success">
          {success}
          <button onClick={() => setSuccess('')} className="admin-success__close">×</button>
        </div>
      )}

      {/* Profile Form */}
      <form onSubmit={handleSubmit} className="admin-form profile-form">
        <div className="profile-section">
          <h2 className="profile-section__title">Personal Information</h2>
          
          <div className="profile-image-container">
            <h3 className="profile-image-title">Profile Photo</h3>
            <ImageUpload
              label=""
              onImageSelect={handleImageSelect}
              currentImage={profileData.profileImage}
              className="profile-image-upload"
              enableCropping={true}
              cropAspectRatio={1}
              cropShape="round"
              showCroppingToggle={false}
            />
            <div className="profile-image-help">
              <p>Upload your profile photo. You'll be able to crop it after uploading.</p>
            </div>
          </div>
          
          <div className="admin-form__row">
            <div className="admin-form__field">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                value={profileData.name}
                onChange={handleInputChange}
                placeholder="Your Full Name"
              />
            </div>
            
            <div className="admin-form__field">
              <label>Professional Title</label>
              <input
                type="text"
                name="title"
                value={profileData.title}
                onChange={handleInputChange}
                placeholder="e.g., Full Stack Developer"
              />
            </div>
          </div>
          
          <div className="admin-form__field">
            <label>Bio / Description</label>
            <textarea
              name="bio"
              value={profileData.bio}
              onChange={handleInputChange}
              rows="4"
              placeholder="Tell visitors about yourself, your experience, and what you're passionate about..."
            />
          </div>
        </div>

        <div className="profile-section">
          <h2 className="profile-section__title">Account & Security</h2>

          {/* Username Update */}
          <div className="admin-form__row">
            <div className="admin-form__field">
              <label>Admin Username</label>
              <input
                type="text"
                name="adminUsername"
                value={account.username}
                onChange={handleUsernameChange}
                placeholder="your_admin_username"
              />
            </div>
            <div className="admin-form__field admin-form__field--actions">
              <label>&nbsp;</label>
              <button
                type="button"
                className="admin-btn admin-btn--secondary"
                onClick={updateUsername}
                disabled={account.loading}
              >
                {account.loading ? 'Updating...' : 'Update Username'}
              </button>
            </div>
          </div>
          {account.error && (
            <div className="admin-error">{account.error}</div>
          )}
          {account.success && (
            <div className="admin-success">{account.success}</div>
          )}

          {/* Password Change */}
          <div className="admin-form__row">
            <div className="admin-form__field">
              <label>Current Password</label>
              <input
                type="password"
                name="currentPassword"
                value={passwordForm.currentPassword}
                onChange={handlePasswordInput}
                placeholder="Enter current password"
              />
            </div>
            <div className="admin-form__field">
              <label>New Password</label>
              <input
                type="password"
                name="newPassword"
                value={passwordForm.newPassword}
                onChange={handlePasswordInput}
                placeholder="Enter new password"
              />
            </div>
          </div>

          <div className="admin-form__row">
            <div className="admin-form__field">
              <label>Confirm New Password</label>
              <input
                type="password"
                name="confirmNewPassword"
                value={passwordForm.confirmNewPassword}
                onChange={handlePasswordInput}
                placeholder="Re-enter new password"
              />
            </div>
            <div className="admin-form__field admin-form__field--actions">
              <label>&nbsp;</label>
              <button
                type="button"
                className="admin-btn admin-btn--warning"
                onClick={changePassword}
                disabled={passwordStatus.loading}
              >
                {passwordStatus.loading ? 'Updating...' : 'Change Password'}
              </button>
            </div>
          </div>

          {passwordStatus.error && (
            <div className="admin-error">{passwordStatus.error}</div>
          )}
          {passwordStatus.success && (
            <div className="admin-success">{passwordStatus.success}</div>
          )}
        </div>

        <div className="profile-section">
          <h2 className="profile-section__title">Contact Information</h2>
          
          <div className="admin-form__field">
            <label>Contact Description</label>
            <textarea
              name="contactDescription"
              value={profileData.contactDescription}
              onChange={handleInputChange}
              rows="3"
              placeholder="Write a brief description for the contact section (e.g., 'Feel free to reach out for collaboration opportunities or just to say hello!')"
            />
            <small className="field-help">This description appears at the top of your contact page</small>
          </div>
          
          <div className="admin-form__row">
            <div className="admin-form__field">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={profileData.email}
                onChange={handleInputChange}
                placeholder="your.email@example.com"
              />
            </div>
            
            <div className="admin-form__field">
              <label>Phone</label>
              <input
                type="tel"
                name="phone"
                value={profileData.phone}
                onChange={handleInputChange}
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>
          
          <div className="admin-form__row">
            <div className="admin-form__field">
              <label>Location</label>
              <input
                type="text"
                name="location"
                value={profileData.location}
                onChange={handleInputChange}
                placeholder="City, Country"
              />
            </div>
            
            <div className="admin-form__field">
              <label>Website</label>
              <input
                type="text"
                name="website"
                value={profileData.website}
                onChange={handleInputChange}
                placeholder="yourwebsite.com (http/https will be added when needed)"
              />
            </div>
          </div>
        </div>

        <div className="profile-section">
          <h2 className="profile-section__title">Social Media</h2>
          
          <div className="admin-form__row">
            <div className="admin-form__field">
              <label>GitHub</label>
              <input
                type="text"
                name="github"
                value={profileData.github}
                onChange={handleInputChange}
                placeholder="github.com/yourusername"
              />
            </div>
            
            <div className="admin-form__field">
              <label>LinkedIn</label>
              <input
                type="text"
                name="linkedin"
                value={profileData.linkedin}
                onChange={handleInputChange}
                placeholder="linkedin.com/in/yourprofile"
              />
            </div>
          </div>
          
          <div className="admin-form__row">
            <div className="admin-form__field">
              <label>Twitter</label>
              <input
                type="text"
                name="twitter"
                value={profileData.twitter}
                onChange={handleInputChange}
                placeholder="twitter.com/yourusername"
              />
            </div>
            
            <div className="admin-form__field">
              <label>Instagram</label>
              <input
                type="text"
                name="instagram"
                value={profileData.instagram}
                onChange={handleInputChange}
                placeholder="instagram.com/yourusername"
              />
            </div>
          </div>
        </div>

        <div className="profile-section">
          <h2 className="profile-section__title">Documents</h2>
          
          <p>Resumes are managed from the <a href="/admin/resumes">Resumes Manager</a>.</p>
        </div>

        <div className="profile-form__actions">
          <button type="submit" className="admin-btn admin-btn--primary admin-btn--large">
            Save Profile
          </button>
        </div>
      </form>

      {profileData.profileImage && (
        <div className="profile-preview">
          <h3>Profile Image Preview</h3>
          <img 
            src={profileData.profileImage} 
            alt="Profile preview" 
            className="profile-preview__image"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>
      )}
    </div>
  );
};

export default ProfileManager;
