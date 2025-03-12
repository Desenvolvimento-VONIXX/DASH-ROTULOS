import { defineConfig } from 'vite'
import path from "path"
import react from '@vitejs/plugin-react-swc'
import { convertToSankhyaBI } from "@insulino/vite-plugin-2sankhyabi"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), { ...convertToSankhyaBI(), apply: "build" }],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/mge": {
        target: "http://192.168.0.101:8180",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/mge/, "/mge/"),
      },
    },
  },
})
