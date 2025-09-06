// API Base Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
const SERVER_BASE_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5001';

// API Response Handler
const handleResponse = async (response) => {
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  
  return data;
};

// Helper to format image URLs
export const formatImageUrl = (imageUrl) => {
  if (!imageUrl) return '';
  
  // If already a full URL, return as is
  if (imageUrl.startsWith('http')) {
    return imageUrl;
  }
  
  // If it's a relative path starting with /, prepend server base URL
  if (imageUrl.startsWith('/')) {
    const url = `${SERVER_BASE_URL}${imageUrl}`;
    return url;
  }
  
  // Otherwise, assume it's a relative path and prepend server URL with /
  return `${SERVER_BASE_URL}/${imageUrl}`;
};

// Helper to format generic file URLs
export const formatFileUrl = (fileUrl) => {
  if (!fileUrl) return '';
  if (fileUrl.startsWith('http')) return fileUrl;
  if (fileUrl.startsWith('/')) return `${SERVER_BASE_URL}${fileUrl}`;
  return `${SERVER_BASE_URL}/${fileUrl}`;
};

// Contact Messages API
export const contactAPI = {
  submit: async (messageData) => {
    return apiRequest('/contact', {
      method: 'POST',
      body: JSON.stringify(messageData)
    });
  },
  
  getAll: async () => {
    return apiRequest('/contact', {
      method: 'GET'
    });
  },
  
  markAsRead: async (id) => {
    return apiRequest(`/contact/${id}/read`, {
      method: 'PATCH'
    });
  },
  
  delete: async (id) => {
    return apiRequest(`/contact/${id}`, {
      method: 'DELETE'
    });
  }
};

// API Request Helper
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Add auth token if available
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, config);
    return await handleResponse(response);
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};

// Authentication API
export const authAPI = {
  login: async (credentials) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  getProfile: async () => {
    return apiRequest('/auth/profile');
  },

  updateProfile: async (profileData) => {
    return apiRequest('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },

  changePassword: async (passwordData) => {
    return apiRequest('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify(passwordData),
    });
  },

  verifyToken: async () => {
    return apiRequest('/auth/verify');
  },
};

// Projects API
export const projectsAPI = {
  // Public endpoints
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/portfolio/projects${queryString ? `?${queryString}` : ''}`);
  },

  getById: async (id) => {
    return apiRequest(`/portfolio/projects/${id}`);
  },

  getFeatured: async () => {
    return apiRequest('/portfolio/featured');
  },

  // Admin endpoints
  getAllAdmin: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/portfolio/admin/projects${queryString ? `?${queryString}` : ''}`);
  },

  create: async (projectData) => {
    return apiRequest('/portfolio/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  },

  update: async (id, projectData) => {
    return apiRequest(`/portfolio/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(projectData),
    });
  },

  delete: async (id) => {
    return apiRequest(`/portfolio/projects/${id}`, {
      method: 'DELETE',
    });
  },
};

// Skills API
export const skillsAPI = {
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/skills${queryString ? `?${queryString}` : ''}`);
  },

  getById: async (id) => {
    return apiRequest(`/skills/${id}`);
  },

  getFeatured: async () => {
    return apiRequest('/skills/featured');
  },

  getByCategory: async (category) => {
    return apiRequest(`/skills/category/${category}`);
  },

  create: async (skillData) => {
    return apiRequest('/skills', {
      method: 'POST',
      body: JSON.stringify(skillData),
    });
  },

  update: async (id, skillData) => {
    return apiRequest(`/skills/${id}`, {
      method: 'PUT',
      body: JSON.stringify(skillData),
    });
  },

  delete: async (id) => {
    return apiRequest(`/skills/${id}`, {
      method: 'DELETE',
    });
  },
};

// Certificates API
export const certificatesAPI = {
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/certificates${queryString ? `?${queryString}` : ''}`);
  },

  getById: async (id) => {
    return apiRequest(`/certificates/${id}`);
  },

  getFeatured: async () => {
    return apiRequest('/certificates/featured');
  },

  getByCategory: async (category) => {
    return apiRequest(`/certificates/category/${category}`);
  },

  create: async (certificateData) => {
    return apiRequest('/certificates', {
      method: 'POST',
      body: JSON.stringify(certificateData),
    });
  },

  update: async (id, certificateData) => {
    return apiRequest(`/certificates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(certificateData),
    });
  },

  delete: async (id) => {
    return apiRequest(`/certificates/${id}`, {
      method: 'DELETE',
    });
  },
};

// Profile API
export const profileAPI = {
  get: async () => {
    try {
      return await apiRequest('/profile');
    } catch (error) {
      // Return default/empty profile if no profile exists
      return {
        status: 'success',
        data: {
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
          profileImage: '',
          resume: ''
        }
      };
    }
  },

  update: async (profileData) => {
    return apiRequest('/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },
};

// Health Check
export const healthAPI = {
  check: async () => {
    return apiRequest('/health');
  },
};

// Upload API with file handling support
export const uploadAPI = {
  // Custom method for file uploads that doesn't use JSON
  uploadImage: async (imageFile) => {
    const url = `${API_BASE_URL}/upload/image`;
    const formData = new FormData();
    formData.append('image', imageFile);
    
    const token = localStorage.getItem('adminToken');
    const headers = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Image Upload Error:', error);
      throw error;
    }
  },
  // Upload certificate file (pdf/images)
  uploadCertificate: async (file) => {
    const url = `${API_BASE_URL}/upload/certificate`;
    const formData = new FormData();
    formData.append('certificate', file);
    const token = localStorage.getItem('adminToken');
    const headers = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    try {
      const response = await fetch(url, { method: 'POST', headers, body: formData });
      return await handleResponse(response);
    } catch (error) {
      console.error('Certificate Upload Error:', error);
      throw error;
    }
  },
  
  deleteImage: async (filename) => {
    return apiRequest(`/upload/image/${filename}`, {
      method: 'DELETE',
    });
  },

  // Upload resume file
  uploadResume: async (resumeFileOrForm) => {
    const url = `${API_BASE_URL}/upload/resume`;
    const token = localStorage.getItem('adminToken');
    const headers = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    // Always accept JSON response
    headers.Accept = 'application/json';
    
    let body;
    if (resumeFileOrForm instanceof FormData) {
      body = resumeFileOrForm;
    } else {
      const formData = new FormData();
      formData.append('resume', resumeFileOrForm);
      body = formData;
    }
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body,
        mode: 'cors'
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Resume Upload Error:', error);
      throw error;
    }
  },

  // Get resume file (if needed)
  getResume: async () => {
    return apiRequest('/upload/resume', {
      method: 'GET'
    });
  },

  // Delete resume file
  deleteResume: async (filename) => {
    return apiRequest(`/upload/resume/${encodeURIComponent(filename)}`, {
      method: 'DELETE'
    });
  }
};

// Export all APIs
export default {
  auth: authAPI,
  projects: projectsAPI,
  skills: skillsAPI,
  certificates: certificatesAPI,
  profile: profileAPI,
  health: healthAPI,
  upload: uploadAPI,
};