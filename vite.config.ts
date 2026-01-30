import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import * as path from "node:path";

export default defineConfig({
  plugins: [react()],
  
  // Estrutura Tauri 2.0: src/ como root
  publicDir: '../public',
  
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  css: {
    postcss: './postcss.config.js',  // opcional, auto-detecta
  },

  // Tauri dev/build settings
  clearScreen: false,
  server: {
    host: '127.0.0.1',
    port: 3000,
    strictPort: true,
    watch: {
      ignored: ["**/src-tauri/**"],
    },
  },

  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },

  envPrefix: ['VITE_', 'TAURI_'],
})
