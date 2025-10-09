import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Get API URL from environment or use default
const apiUrl = process.env.VITE_API_URL;

export default defineConfig({
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
      '/auth': {
        target: apiUrl,
        changeOrigin: true,
        secure: false,
      },
      '/images': {
        target: apiUrl,
        changeOrigin: true,
        secure: false,
      }
    }
  }
});