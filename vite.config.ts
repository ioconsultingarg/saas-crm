import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// En GitHub Actions el subdirectorio sale solo del nombre del repo
// (ioconsultingarg/saas-crm -> /saas-crm/). Localmente queda en la raiz.
// BASE_PATH permite forzarlo a mano; va SIN barras para que Git Bash en
// Windows no lo convierta en una ruta de disco.
const repo = process.env.GITHUB_REPOSITORY?.split('/')[1]
const manual = process.env.BASE_PATH?.replace(/^\/+|\/+$/g, '')
const base = manual ? `/${manual}/` : repo ? `/${repo}/` : '/'

export default defineConfig({
  base,
  build: {
    rollupOptions: {
      output: {
        // El grafico es lo mas pesado y solo hace falta en la ficha del cliente.
        manualChunks: { grafico: ['recharts'] },
      },
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['apple-touch-icon.png', 'ejemplo-ventas.csv'],
      workbox: {
        globPatterns: ['**/*.{js,css,html,woff2,png,svg,csv}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      },
      manifest: {
        name: 'IO-CRM',
        short_name: 'IO-CRM',
        description: 'Quien te deja de comprar, cuanto vale y a quien llamar el lunes.',
        lang: 'es-AR',
        dir: 'ltr',
        display: 'standalone',
        display_override: ['window-controls-overlay', 'standalone'],
        orientation: 'any',
        background_color: '#FAF8F5',
        theme_color: '#FAF8F5',
        categories: ['business', 'productivity'],
        icons: [
          { src: 'icono-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icono-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icono-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
})
