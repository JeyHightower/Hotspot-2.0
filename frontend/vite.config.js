import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  build: {
    rollupOptions: {
      external: ['react-router-dom', 'js-cookie', 'react-icons/fa', '@reduxjs/toolkit',
        'react-redux',
        'redux',
        'redux-thunk', 'reselect', 'react-icons/fa6']
    }
  },
  plugins: [react()],
});
