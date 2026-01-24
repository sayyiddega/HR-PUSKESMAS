import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,          // = 0.0.0.0 (lebih clean)
    port: 3000,

    // Untuk akses via domain / IP saat DEV
    allowedHosts: [
      'tny.uctech.online'
      // '.uctech.online'
    ],

    // DEV proxy saja (Vite DEV server)
    proxy: {
      '/api': {
        target: 'https://apitny.uctech.online',
        changeOrigin: true,
        secure: true        // karena HTTPS
      },
      '/files': {
        target: 'https://apitny.uctech.online',
        changeOrigin: true,
        secure: true
      }
    }
  }
})

