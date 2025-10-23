import dotenv from 'dotenv';

dotenv.config();

// Determine environment
const NODE_ENV = process.env.NODE_ENV || 'development';
const isProduction = NODE_ENV === 'production';
const isDevelopment = NODE_ENV === 'development';

// Environment-specific configuration
const config = {
  // Environment info
  env: NODE_ENV,
  isProduction,
  isDevelopment,

  // Application
  app: {
    port: process.env.APP_PORT || 3007,
    username: process.env.APP_USERNAME || 'app_user'
  },

  // URLs based on environment
  urls: isProduction ? {
    frontend: 'https://app.uribarri.online',
    api: 'https://api.uribarri.online',
    domain: 'https://uribarri.online'
  } : {
    frontend: process.env.FRONTEND_URL || 'http://localhost:5173',
    api: process.env.VITE_API_URL || 'http://localhost:3007',
    domain: 'http://localhost:5173'
  },

  // CORS configuration
  cors: {
    origin: isProduction
      ? [
          'https://uribarri.online',
          'https://app.uribarri.online',
          'https://api.uribarri.online',
        ]
      : [
          'http://localhost:5173',
          'http://localhost:3007',
          'http://127.0.0.1:5173',
          process.env.FRONTEND_URL || 'http://localhost:5173'
        ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Shop-ID',
      'X-Shop-Name',
      'X-Product-ID',
      'X-Package-ID',
      'X-Publication-ID',
      'X-Organization-ID',
      'X-User-ID',
      'x-user-name',
      'Content-Disposition'
    ],
    exposedHeaders: ['Content-Disposition']
  },

  // Database
  database: {
    host: process.env.MYSQL_HOST || 'localhost',
    port: process.env.MYSQL_PORT || 3306,
    name: process.env.MYSQL_DATABASE || 'uribarri_db',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    rootPassword: process.env.MYSQL_ROOT_PASSWORD || ''
  },

  // Rate limiting
  rateLimiting: {
    maxRegistrations: parseInt(process.env.MAX_REGISTRATIONS || '10', 10),
    resetHours: parseInt(process.env.RESET_HOURS || '24', 10)
  },

  // Email
  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    user: process.env.EMAIL_USER || '',
    password: process.env.EMAIL_PASS || ''
  }
};

// Helper function to log environment info
export const logEnvironmentInfo = () => {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║           ENVIRONMENT CONFIGURATION                    ║');
  console.log('╠════════════════════════════════════════════════════════╣');
  console.log(`║ Environment:    ${config.env.padEnd(33)} ║`);
  console.log(`║ App Port:       ${String(config.app.port).padEnd(33)} ║`);
  console.log(`║ Frontend URL:   ${config.urls.frontend.padEnd(33)} ║`);
  console.log(`║ API URL:        ${config.urls.api.padEnd(33)} ║`);
  console.log(`║ Database Host:  ${config.database.host.padEnd(33)} ║`);
  console.log('╚════════════════════════════════════════════════════════╝');
};

export default config;
