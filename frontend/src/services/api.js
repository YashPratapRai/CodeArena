import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
console.log('🚀 API Base URL being used:', API_BASE_URL);
console.log('📁 Environment value:', import.meta.env.VITE_API_BASE_URL);

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error);
      throw new Error('Network error. Please check your connection.');
    }

    const { status, data } = error.response;

    // Handle specific HTTP status codes
    switch (status) {
      case 401:
        // Token expired or invalid
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('storage'));
        break;

      case 403:
        // Forbidden - insufficient permissions
        console.error('Forbidden:', data.message);
        break;

      case 404:
        // Resource not found
        console.error('Not found:', data.message);
        break;

      case 429:
        // Rate limit exceeded
        console.error('Rate limit exceeded:', data.message);
        break;

      case 500:
        // Server error
        console.error('Server error:', data.message);
        break;

      default:
        console.error('API error:', data.message);
    }

    // Return a consistent error format
    return Promise.reject({
      status: status,
      message: data?.message || 'An error occurred',
      data: data
    });
  }
);

// Helper methods for common API operations
export const apiHelper = {
  // Handle API calls with loading state
  withLoading: async (apiCall, setLoading = null) => {
    try {
      if (setLoading) setLoading(true);
      const response = await apiCall;
      return response.data;
    } catch (error) {
      throw error;
    } finally {
      if (setLoading) setLoading(false);
    }
  },

  // Handle paginated responses
  parsePagination: (response) => {
    return {
      data: response.data,
      pagination: {
        page: response.data.currentPage,
        totalPages: response.data.totalPages,
        total: response.data.total,
        hasNext: response.data.currentPage < response.data.totalPages,
        hasPrev: response.data.currentPage > 1
      }
    };
  },

  // Upload file helper
  uploadFile: (file, onProgress = null) => {
    const formData = new FormData();
    formData.append('file', file);

    return api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      },
    });
  }
};

export default api;