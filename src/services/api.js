import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Important for httpOnly cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for global error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Enhanced error logging
    if (error.response) {
      // Server responded with error
      console.error(`❌ API Error: ${error.response.status}`, {
        url: error.config?.url,
        method: error.config?.method,
        data: error.response.data,
        headers: error.response.headers
      });
      
      // Check for CORS/Cookie issues
      if (error.response.status === 401 && !error.response.data) {
        console.error('🔐 Authentication failed - possible CORS/Cookie issue');
        console.error('Check: Backend CORS settings, Cookie SameSite/Secure attributes');
      }
    } else if (error.request) {
      // Request made but no response
      console.error('❌ No response from server:', error.request);
      console.error('Check: Backend is running, CORS is configured correctly');
    } else {
      // Error in request setup
      console.error('❌ Request setup error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Auth service
export const authService = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
  updatePassword: async (passwordData) => {
    const response = await api.put('/auth/password', passwordData);
    return response.data;
  },
  makeAdmin: async () => {
    const response = await api.post('/auth/make-admin');
    return response.data;
  },
};

export default api;