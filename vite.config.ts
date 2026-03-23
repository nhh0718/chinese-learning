import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /\/api\/v1\/vocabulary/,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'vocabulary-cache', expiration: { maxEntries: 500, maxAgeSeconds: 86400 } }
          },
          {
            urlPattern: /\/api\/v1\/review/,
            handler: 'NetworkFirst',
            options: { cacheName: 'review-cache', expiration: { maxEntries: 100, maxAgeSeconds: 3600 } }
          }
        ]
      },
      manifest: {
        name: 'Học Tiếng Trung',
        short_name: '學中文',
        description: 'Learn Chinese - HSK & TOCFL Exam Prep',
        theme_color: '#e53935',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
        ]
      }
    })
  ],
  server: {
    port: 5173
  },
  envPrefix: 'VITE_'
})
