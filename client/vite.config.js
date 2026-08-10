import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    basicSsl(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'CleanConnect PWA',
        short_name: 'CleanConnect',
        description: 'Report and manage municipality issues.',
        theme_color: '#4CAF50',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  server: {
    host: true, // This makes the server accessible on your local network
    https: true, // This enables the secure HTTPS server
    port: 5173, // Your designated frontend port
    
    // --- THE FIX IS HERE ---
    // This 'proxy' configuration tells Vite how to handle different types of requests.
    proxy: {
      // Rule 1: Forward all API requests (starting with /api) to the backend.
      '/api': {
        target: process.env.VITE_API_TARGET || 'http://localhost:5000', // The address of your backend server
        changeOrigin: true,
      },
      // Rule 2: Forward all image requests (starting with /uploads) to the backend as well.
      // This is the missing piece that fixes the 404 error.
      '/uploads': {
        target: process.env.VITE_API_TARGET || 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  }
});