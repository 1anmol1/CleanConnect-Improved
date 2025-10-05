import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'; // 1. Import the SSL plugin


export default defineConfig({
  plugins: [react(),
    basicSsl()

  ],
  server: {
    host: true, // Expose to LAN
    https: true, // Enable HTTPS
    port: 5173, // Explicitly set the port
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // Your backend server
        changeOrigin: true,
      }
    }
  }
})