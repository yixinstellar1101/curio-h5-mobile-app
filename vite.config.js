import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5175,
    strictPort: true,
    host: 'localhost',
  },
  base: '/',
  build: {
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          // 保持原始文件名
          return `assets/${assetInfo.name}`;
        }
      }
    }
  },
  publicDir: 'src/assets',
  define: {
    // 在构建时直接替换为生产环境的后端URL
  'import.meta.env.VITE_BACKEND_API_BASE': JSON.stringify('https://curio-backend.kindstone-04fc122c.swedencentral.azurecontainerapps.io'),
  'import.meta.env.VITE_BUILD_VERSION': JSON.stringify(new Date().toISOString())
  }
})
