import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  // GitHub Pages 部署在 /<repo>/ 子路径下；本地与 Vercel 等仍用根路径
  base: process.env.GITHUB_ACTIONS ? '/wms-wcs-system/' : '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5180,
  },
})
