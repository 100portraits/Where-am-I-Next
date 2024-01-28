import { defineConfig } from 'vite'
import { VitePWA } from "vite-plugin-pwa";

import react from '@vitejs/plugin-react'

const pwaConfig = {
  srcDir: "src",
  strategies: "injectManifest",
  includeAssets: ["favicon.svg", "favicon.ico", "robots.txt", "apple-touch-icon.png"],
  manifest: {
    name: "Rooster",
    short_name: "Rooster",
    description: "Rooster is a simple, beautiful, and modern markdown editor.",
    theme_color: "#ffffff",
    
    icons: [
      {
        src: "icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable",
      },
    ],
  },
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), VitePWA(pwaConfig)],
})
