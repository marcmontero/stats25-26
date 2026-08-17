import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/favicon-32.png'],
      manifest: {
        name: "AEB Stats · Estadístiques AE Badalonès",
        short_name: 'AEB Stats',
        description: "Estadístiques dels equips de l'A.E. Badalonès",
        start_url: '/',
        display: 'standalone',
        background_color: '#14110d',
        theme_color: '#14110d',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Les dades de partits/stats sempre s'han de demanar en directe
        // primer (si hi ha connexió); nomes fem servir la copia guardada
        // quan no hi ha xarxa. L'aplicaci\u00f3 en si (HTML/CSS/JS/icones) es
        // guarda perqu\u00e8 obri a l'instant encara que la xarxa vagi lenta.
        runtimeCaching: [
          {
            urlPattern: /\/(matchUrls|discoveredUrls)\.json/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'app-data',
              networkTimeoutSeconds: 4,
              expiration: { maxEntries: 5, maxAgeSeconds: 60 * 60 * 24 },
            },
          },
          {
            urlPattern: /^https:\/\/msstats\.optimalwayconsulting\.com\//,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'match-stats',
              networkTimeoutSeconds: 6,
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 7 },
            },
          },
        ],
      },
    }),
  ],
})