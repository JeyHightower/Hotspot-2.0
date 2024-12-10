import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import eslint from 'vite-plugin-eslint';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  root: 'frontend',
  build: {
    outDir: '../dist',
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
// To automatically open the app in the browser whenever the server starts,
// uncomment the following lines:
// server: {
//   open: true
// }
Hotspot - 2.0 / frontend / index.html;
