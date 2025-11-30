import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://vrs-backend-sg.vercel.app',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  preview: {
    host: true,
    port: process.env.PORT || 5173,
    allowedHosts: [
      'vehicle-rental-services.onrender.com',
      '.onrender.com',
      'localhost'
    ]
  }
})
