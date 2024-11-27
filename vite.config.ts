import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [],
      manifest: {
        name: 'VHS Vault',
        short_name: 'VHS Vault',
        description: 'Your Digital VHS Collection - A retro-styled movie collection manager',
        theme_color: '#9333EA',
        background_color: '#000000',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        orientation: 'portrait-primary',
        categories: ['entertainment', 'movies'],
        icons: [
          {
            src: 'https://placehold.co/64x64/9333EA/ffffff.png',
            sizes: '64x64',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'https://placehold.co/192x192/9333EA/ffffff.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'https://placehold.co/512x512/9333EA/ffffff.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'https://placehold.co/512x512/9333EA/ffffff.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
        screenshots: [
          {
            src: 'https://placehold.co/2048x1170/9333EA/ffffff.png',
            sizes: '2048x1170',
            type: 'image/png',
            form_factor: 'wide'
          },
          {
            src: 'https://placehold.co/1170x2048/9333EA/ffffff.png',
            sizes: '1170x2048',
            type: 'image/png',
            form_factor: 'narrow'
          }
        ],
        shortcuts: [
          {
            name: 'Add Movie',
            url: '/',
            icons: [{ src: 'https://placehold.co/96x96/9333EA/ffffff.png', sizes: '96x96' }]
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.href.includes('omdbapi.com'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'omdb-api-cache',
              networkTimeoutSeconds: 10,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 // 24 hours
              },
              cacheableResponse: {
                statuses: [0, 200]
              },
              matchOptions: {
                ignoreSearch: true
              },
            }
          },
          {
            urlPattern: ({ url }) => /\.(jpg|jpeg|png|gif|webp)$/i.test(url.pathname),
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              fetchOptions: {
                mode: 'no-cors'
              },
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: ({ url }) => url.href.includes('qjvbbmmaeyikdrjcovei.supabase.co'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-cache',
              networkTimeoutSeconds: 5,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 5 // 5 minutes
              },
              cacheableResponse: {
                statuses: [0, 200]
              },
              backgroundSync: {
                name: 'supabaseSync',
                options: {
                  maxRetentionTime: 24 * 60 // Retry for up to 24 hours
                }
              }
            }
          }
        ]
      },
      devOptions: { enabled: false },
      injectRegister: 'auto'
    })
  ],
  optimizeDeps: {
    exclude: ['lucide-react']
  }
});