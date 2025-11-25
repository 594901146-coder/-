import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // 关键配置：确保资源使用相对路径，适配 file:/// 协议
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  }
});