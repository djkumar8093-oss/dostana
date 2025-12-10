import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      strategies: "injectManifest", // Use your custom service worker
      registerType: "autoUpdate",
      injectRegister: false,
      includeManifestIcons: false,
      filename: "sw.js",

      includeAssets: ["favicon.ico", "companyFavicon.png", "src/assets/*.png", "src/assets/sounds/*.mp3", "src/animation/offline.json"],
      manifest: {
        name: "Dostana - Making Friends Together",
        short_name: "Dostana",
        description: "Dostana - A social media app",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#1976d2",
        icons: [
          {
            src: "/companyFaviIcon.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/companyFaviIcon.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
      srcDir: "src/service-worker",
      injectManifest: {
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
            },
          },
        ],
      },
      devOptions: {
        enabled: true,
        type: "module",
        navigateFallback: "/",
      },
    }),
  ],
  build: {},
});
