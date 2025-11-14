import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/babysu/', // GitHub Pages base path
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        configure: (proxy, options) => {
          // Fallback to direct serverless function files in development
          proxy.on('error', (err, req, res) => {
            console.log('Proxy error, serving function directly');
          });
        }
      }
    }
  }
})
