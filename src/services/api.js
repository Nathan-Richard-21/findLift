import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Important for httpOnly cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper to get token from cookie OR localStorage
const getTokenFromCookie = () => {
  // First try cookie
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'token') {
      return value;
    }
  }
  // Fallback to localStorage
  return localStorage.getItem('token');
};

// Request interceptor to add token from cookie to Authorization header
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
    
    // Skip adding auth header for login/register/google auth endpoints
    const publicEndpoints = ['/auth/login', '/auth/register', '/auth/google'];
    const isPublicEndpoint = publicEndpoints.some(endpoint => config.url?.includes(endpoint));
    
    if (!isPublicEndpoint) {
      // Get token from cookie and add to Authorization header
      // This is needed because cookies from www.findlift.co.za can't be sent to find-lift-back.vercel.app
      const token = getTokenFromCookie();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log(`🔑 Added Authorization header (token length: ${token.length})`);
      } else {
        console.log('⚠️ No token found in cookies');
        console.log('   Current cookies:', document.cookie);
      }
    } else {
      console.log('ℹ️ Skipping Authorization header for public endpoint');
    }
    
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