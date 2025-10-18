//update: Updated vite.config.js to proxy backend assets
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

//update: Export a function that receives mode and command to access environment variables
export default defineConfig(({ mode }) => {
  //update: Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');
  
  //update: Get API URL from environment variable or use default
  const apiUrl = 'localhost:3007'; // Default for local development
  // const apiUrl = env.VITE_API_URL;
  
  if (env.VITE_API_URL) {
    console.log('VITE_API_URL from env:', env.VITE_API_URL);
  }
  
  console.log('--------------- >>>>   Vite config - API URL:', apiUrl);
  console.log('Vite config - Mode:', mode);

  return {
    plugins: [react()],
    server: {
      host: true, // Listen on all addresses
      port: 5173,
      proxy: {
        // Proxy all API requests to the backend server
        '/shop': {
          target: apiUrl,
          changeOrigin: true,
          secure: false,
        },
        '/user': {
          target: apiUrl,
          changeOrigin: true,
          secure: false,
        },
        '/product': {
          target: apiUrl,
          changeOrigin: true,
          secure: false,
        },
        '/package': {
          target: apiUrl,
          changeOrigin: true,
          secure: false,
        },
        '/provider': {
          target: apiUrl,
          changeOrigin: true,
          secure: false,
        },
        '/type': {
          target: apiUrl,
          changeOrigin: true,
          secure: false,
        },
        '/subtype': {
          target: apiUrl,
          changeOrigin: true,
          secure: false,
        },
        '/order': {
          target: apiUrl,
          changeOrigin: true,
          secure: false,
        },
        '/organization': {
          target: apiUrl,
          changeOrigin: true,
          secure: false,
        },
        '/participant': {
          target: apiUrl,
          changeOrigin: true,
          secure: false,
        },
        '/publication': {
          target: apiUrl,
          changeOrigin: true,
          secure: false,
        },
        '/auth': {
          target: apiUrl,
          changeOrigin: true,
          secure: false,
        },
        //update: Keep legacy images route for backward compatibility
        // But exclude portraits which are static frontend assets
        '/images/uploads': {
          target: apiUrl,
          changeOrigin: true,
          secure: false,
        },
        //update: Add new proxy for backend assets
        '/assets': {
          target: apiUrl,
          changeOrigin: true,
          secure: false,
        }
      }
    }
  };
});