import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 8080,
    proxy: {
      '/api': {
        target: 'http://api.reachflow.cc',
        changeOrigin: true,
        // 保持 /api 前缀，因为后端路径也是 /api/xxx
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
