import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';
// //@ts-expect-error no typeshed
// import eslint from 'vite-plugin-eslint';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    // eslint({
    //   lintOnStart: true,
    //   failOnError: mode === 'production',
    // }),
  ],
  server: {
    proxy: { '/api': 'http://localhost:5000' },
    open: true,
  },
}));
