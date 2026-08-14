// frontend/vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  envDir: '../',
  server: {
    port: 5173,
    proxy: {
      // Any request starting with /api will be forwarded to Django
      '/api': {
        target: 'http://backend:8000',
        changeOrigin: true,
      },
      // Media files proxy (for uploaded images and cached thumbnails)
      '/media': {
        target: 'http://backend:8000',
        changeOrigin: true,
      },
      // WebSocket proxy (for chat and real-time notifications)
      '/ws': {
        target: 'http://backend:8000',
        changeOrigin: true,
        ws: true,
      },
    },
  },
});

