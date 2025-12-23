/// <reference types="vitest" />
import react from "@vitejs/plugin-react"
import path from "path"
import { defineConfig } from "vitest/config"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    // Proxy API requests to Azure Functions during development
    proxy: {
      "/api": {
        target: "http://localhost:7071",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    // Optimize for production
    target: "es2022",
    minify: "esbuild",
    sourcemap: true,
    // Split chunks for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          router: ["react-router-dom"],
          query: ["@tanstack/react-query"],
        },
      },
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: ["node_modules/", "src/test/"],
    },
  },
})
