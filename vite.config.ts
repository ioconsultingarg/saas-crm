import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

/**
 * El codigo fuente vive en app/ y el sitio compilado se escribe en la RAIZ
 * del repositorio. Asi GitHub Pages publica desde main / (root), igual que
 * los demas demos del portfolio, sin carpeta docs ni workflows.
 *
 * base './' hace que las rutas sean relativas: el sitio funciona tanto en
 * https://usuario.github.io/saas-crm/ como abierto localmente, sin tener
 * que pasarle el subdirectorio al build.
 */
export default defineConfig({
  root: 'app',
  base: './',
  build: {
    outDir: '..',
    // La salida convive con package.json, app/ y node_modules: vaciar el
    // directorio borraria el repositorio entero.
    emptyOutDir: false,
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
        globIgnores: ['app/**', 'node_modules/**', 'scripts/**'],
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
