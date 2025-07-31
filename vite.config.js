import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite"; // Import the Tailwind CSS plugin
import { VitePWA } from 'vite-plugin-pwa';
import path from "path"; // Import path for alias resolution

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // Add the Tailwind CSS plugin here
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB limit
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              }
            }
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          }
        ]
      },
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'YakRooms',
        short_name: 'YakRooms',
        description: 'Discover Authentic Stays in Bhutan with YakRooms - Your convenient way to book locally',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: '/',
        start_url: '/',
                       icons: [
                 {
                   src: '/icons/icon-192x192.png',
                   sizes: '192x192',
                   type: 'image/png',
                   purpose: 'any'
                 },
                 {
                   src: '/icons/icon-512x512.png',
                   sizes: '512x512',
                   type: 'image/png',
                   purpose: 'any'
                 },
                 {
                   src: '/icons/icon-152x152.png',
                   sizes: '152x152',
                   type: 'image/png',
                   purpose: 'any'
                 },
                 {
                   src: '/icons/icon-144x144.png',
                   sizes: '144x144',
                   type: 'image/png',
                   purpose: 'any'
                 },
                 {
                   src: '/icons/icon-128x128.png',
                   sizes: '128x128',
                   type: 'image/png',
                   purpose: 'any'
                 },
                 {
                   src: '/icons/icon-96x96.png',
                   sizes: '96x96',
                   type: 'image/png',
                   purpose: 'any'
                 },
                 {
                   src: '/icons/icon-72x72.png',
                   sizes: '72x72',
                   type: 'image/png',
                   purpose: 'any'
                 },
                 {
                   src: '/icons/icon-384x384.png',
                   sizes: '384x384',
                   type: 'image/png',
                   purpose: 'any'
                 }
               ]
      }
    })
  ],
  resolve: {
    alias: {
      // This alias is crucial for shadcn/ui component imports
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    global: 'globalThis',
  },
  server: {
    historyApiFallback: true, // optional for dev
  }
});