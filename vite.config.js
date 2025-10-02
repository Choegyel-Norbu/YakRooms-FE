import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from 'vite-plugin-pwa';
import path from "path";
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        // Simple static asset caching
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024, // 3MB limit
      },
      // Use external manifest file
      manifest: false,
      // Include essential assets
      includeAssets: ['favicon.ico', 'apple-touch-icon.png']
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(fileURLToPath(new URL('./src', import.meta.url))),
    },
  },
  define: {
    global: 'globalThis',
  },
  server: {
    historyApiFallback: true,
    // Allow ngrok and other tunneling services
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      '.ngrok.io',
      '.ngrok-free.app',
      '.ngrok.app'
    ],
    // Proxy configuration for SameSite=Lax compatibility in development
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        // This makes API requests appear same-origin, enabling SameSite=Lax
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            // Ensure cookies are forwarded properly
            if (req.headers.cookie) {
              proxyReq.setHeader('Cookie', req.headers.cookie);
            }
          });
        }
      }
    }
  }
});