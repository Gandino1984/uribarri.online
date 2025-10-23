import axios from 'axios';
import config from '../../config/environment.js';

//update: Get API URL from centralized config
const apiUrl = config.urls.api;

console.log('🔧 Axios Config - API URL:', apiUrl);

// Create axios instance with proper configuration
const axiosInstance = axios.create({
  baseURL: apiUrl,
  timeout: 30000, // 30 seconds timeout for file uploads
  withCredentials: true // Important for cookies/sessions if you use them
});

// Add request interceptor for debugging
axiosInstance.interceptors.request.use(
  (config) => {
    // Log the request in development
    if (import.meta?.env?.DEV) {
      console.log(`[${config.method?.toUpperCase()}] ${config.url}`, config);
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle CORS and network errors specifically
    if (error.message === 'Network Error') {
      console.error('Network Error - This may be a CORS issue:', {
        url: error.config?.url,
        method: error.config?.method,
        baseURL: error.config?.baseURL
      });
    } else if (error.response) {
      console.error('API Error:', {
        status: error.response.status,
        data: error.response.data
      });
    } else {
      console.error('Unexpected error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;