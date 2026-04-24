import { defineConfig } from 'vite'
import path from 'path'
import fs from 'fs'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// 检测是否有本地 HTTPS 证书（用于 PWA 局域网测试）
const certPath = path.resolve(__dirname, '.cert/cert.pem');
const keyPath = path.resolve(__dirname, '.cert/key.pem');
const hasLocalCert = fs.existsSync(certPath) && fs.existsSync(keyPath);

// 🔧 移除构建输出中的 crossorigin 属性和 modulepreload（CloudStudio serve 不返回 CORS header，会导致 JS 静默不执行）
function removeCrossorigin() {
  return {
    name: 'remove-crossorigin',
    enforce: 'post' as const,
    transformIndexHtml(html: string) {
      return html
        .replace(/\s*crossorigin\s*/g, ' ')
        .replace(/<link\s+rel="modulepreload"[^>]*>/g, '')
    }
  }
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    removeCrossorigin(),
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
    allowedHosts: true,
    https: hasLocalCert ? { cert: fs.readFileSync(certPath), key: fs.readFileSync(keyPath) } : undefined,
  },
  preview: {
    host: '0.0.0.0',
    allowedHosts: true,
    port: 4173,
    https: hasLocalCert ? { cert: fs.readFileSync(certPath), key: fs.readFileSync(keyPath) } : undefined,
  },

  build: {
    // ⚠ 不加 crossorigin（CloudStudio 的 serve 不返回 CORS header，会导致 JS 静默不执行）
    // Vite 默认会在 script/link 上加 crossorigin，这里显式关闭
    cssCodeSplit: true,
    chunkSizeWarningLimit: 300,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-router': ['react-router'],
          'vendor-recharts': ['recharts'],
          'vendor-motion': ['motion'],
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
  },
})
