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
        target: 'http://47.110.77.202',
        changeOrigin: true,
        // 保持 /api 前缀，因为后端路径也是 /api/xxx
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // 将 React 相关库打包到一起
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // 将 UI 组件库打包到一起
          'ui-vendor': ['lucide-react'],
          // 将 Markdown 处理打包到一起
          'markdown-vendor': ['react-markdown', 'remark-gfm'],
        },
      },
    },
    // 调整 chunk 大小警告限制
    chunkSizeWarningLimit: 600,
  },
})
