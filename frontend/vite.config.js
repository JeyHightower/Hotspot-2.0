import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import eslint from 'vite-plugin-eslint';

export default defineConfig(({ mode }) => ({
  root: 'frontend', // This should point to the directory containing index.html
  build: {
    outDir: '../dist', // This is where the build output will go
  },
  plugins: [
    react(),
    eslint({
      lintOnStart: true,
      failOnError: mode === 'production',
    }),
  ],
  server: {
    proxy: {
      '/api': 'http://127.0.0.1:5005',
    },
  },
}));
