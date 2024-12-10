import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Export the Vite configuration
export default defineConfig(({ mode }) => {
  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': 'http://localhost:5005'
      }
    }
  };
});