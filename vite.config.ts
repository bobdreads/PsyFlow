import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  root: 'app/frontend', // Define a raiz do frontend
  base: './', // Caminhos relativos para Electron
  build: {
    outDir: '../../dist/frontend',
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './app/frontend'),
    },
  },
  server: {
    port: 3000,
  }
});