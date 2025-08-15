import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5174,
    proxy: {
      '/r1': {
        target: 'https://api.ruckus.cloud',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/r1/, ''),
        headers: {
          // Present as same-origin to upstream
          origin: 'https://api.ruckus.cloud',
        },
        configure: (proxy: any) => {
          proxy.on('proxyReq', (proxyReq: any) => {
            // Strip dev Origin/Referer to avoid upstream CORS/CSRF checks
            try { 
              proxyReq.removeHeader('origin') 
            } catch {
              // Ignore if header doesn't exist
            }
            try { 
              proxyReq.removeHeader('referer') 
            } catch {
              // Ignore if header doesn't exist
            }
          })
        },
      },
      '/r1-eu': {
        target: 'https://api.eu.ruckus.cloud',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/r1-eu/, ''),
        headers: {
          origin: 'https://api.eu.ruckus.cloud',
        },
        configure: (proxy: any) => {
          proxy.on('proxyReq', (proxyReq: any) => {
            try { 
              proxyReq.removeHeader('origin') 
            } catch {
              // Ignore if header doesn't exist
            }
            try { 
              proxyReq.removeHeader('referer') 
            } catch {
              // Ignore if header doesn't exist
            }
          })
        },
      },
      '/r1-asia': {
        target: 'https://api.asia.ruckus.cloud',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/r1-asia/, ''),
        headers: {
          origin: 'https://api.asia.ruckus.cloud',
        },
        configure: (proxy: any) => {
          proxy.on('proxyReq', (proxyReq: any) => {
            try { 
              proxyReq.removeHeader('origin') 
            } catch {
              // Ignore if header doesn't exist
            }
            try { 
              proxyReq.removeHeader('referer') 
            } catch {
              // Ignore if header doesn't exist
            }
          })
        },
      },
    },
  },
})
