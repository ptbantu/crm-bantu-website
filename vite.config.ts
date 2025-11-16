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
    host: '0.0.0.0', // 允许外部访问
    port: 5173, // Vite 默认端口
    strictPort: false,
    // Vite 6.0.9+ 支持 allowedHosts
    allowedHosts: [
      'www.crmbantu.space',
      'crmbantu.space',
      'localhost',
    ],
    hmr: {
      clientPort: 443,
      protocol: 'wss',
    },
    watch: {
      usePolling: true, // 在 Docker 中启用文件监听
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
  },
})

