// Environment configuration for frontend
// This file centralizes all environment-dependent URLs and settings

// Get environment from import.meta.env
const NODE_ENV = import.meta.env.MODE || 'development';
const isProduction = NODE_ENV === 'production';
const isDevelopment = NODE_ENV === 'development';

// Environment-specific configuration
const config = {
  // Environment info
  env: NODE_ENV,
  isProduction,
  isDevelopment,

  // URLs based on environment
  urls: isProduction ? {
    api: 'https://api.uribarri.online',
    app: 'https://app.uribarri.online',
    domain: 'https://uribarri.online'
  } : {
    api: import.meta.env.VITE_API_URL || 'http://localhost:3007',
    app: 'http://localhost:5173',
    domain: 'http://localhost:5173'
  }
};

// Log configuration in development
if (isDevelopment) {
  console.log('🔧 Frontend Environment Config:', {
    mode: config.env,
    apiUrl: config.urls.api,
    appUrl: config.urls.app
  });
}

export default config;
