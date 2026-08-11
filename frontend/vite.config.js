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
        // WebSocket proxy (for assistant status + notifications)
        ws: true,
      },
    },
  },
});
