import { defineConfig } from 'vite'
import path from 'path'
import fs from 'fs'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// 检测是否有本地 HTTPS 证书（用于 PWA 局域网测试）
const certPath = path.resolve(__dirname, '.cert/cert.pem');
const keyPath = path.resolve(__dirname, '.cert/key.pem');
const hasLocalCert = fs.existsSync(certPath) && fs.existsSync(keyPath);

export default defineConfig({
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],

  // 绝对路径，适配 Vercel 等平台部署
  base: '/',

  // 本地预览服务器配置（PWA 需要 HTTPS）
  server: {
    host: '0.0.0.0',
    https: hasLocalCert ? { cert: fs.readFileSync(certPath), key: fs.readFileSync(keyPath) } : undefined,
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
    https: hasLocalCert ? { cert: fs.readFileSync(certPath), key: fs.readFileSync(keyPath) } : undefined,
  },

  build: {
    // 手动 chunk 分割 — 大依赖单独打包，利用浏览器缓存
    rollupOptions: {
      output: {
        manualChunks: {
          // React 核心（不常更新，长期缓存）
          'vendor-react': ['react', 'react-dom'],
          // 路由（独立 chunk）
          'vendor-router': ['react-router'],
          // 图表库（较大，只在报表页用到，懒加载即可）
          'vendor-recharts': ['recharts'],
          // 动画库
          'vendor-motion': ['motion'],
          // UI 基础库
          'vendor-radix': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-popover',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
            '@radix-ui/react-progress',
            '@radix-ui/react-separator',
            '@radix-ui/react-slot',
            '@radix-ui/react-label',
          ],
        },
      },
    },
    // 提高 chunk 拆分阈值提示
    chunkSizeWarningLimit: 300,
    // 启用 CSS 代码分割，减小首屏 CSS 体积
    cssCodeSplit: true,
    // 使用默认 esbuild 压缩，移除 console 和 debugger
    minify: 'esbuild',
  },
  esbuild: {
    drop: ['console', 'debugger'],
  },
})
