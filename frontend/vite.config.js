import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@components": path.resolve(__dirname, "src/components"),
    },
  },
  build: {
    outDir: "dist",
    sourcemap: true,
    rollupOptions: {
      external: [],
    },
  },
  server: {
    proxy: {
      "/api": {
        target:
          process.env.NODE_ENV === "production"
            ? "https://hotspot-2-0-vz4v.onrender.com"
            : "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },
    },
    watch: {
      usePolling: true,
      interval: 100,
    },
  },
});
