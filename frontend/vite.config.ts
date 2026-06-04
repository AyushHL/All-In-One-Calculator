import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import Sitemap from 'vite-plugin-sitemap'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    Sitemap({
      hostname: 'https://www.allinonecalculator.online',
      dynamicRoutes: [
        '/',
        '/scientific-calculator',
        '/age-calculator',
        '/bmi-calculator',
        '/unit-converter',
        '/number-system-converter',
        '/cgpa-calculator',
        '/saved-notes',
        '/history',
      ],
      robots: [{
        userAgent: '*',
        disallow: ['/atom.xml', '/feeds/', '/search']
      }]
    })
  ],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
})
