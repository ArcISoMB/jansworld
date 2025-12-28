import { defineConfig } from 'vite'

export default defineConfig({
  base: '/jansworld/',
  server: {
    port: 5173,
    open: true
  },
  build: {
    outDir: 'dist',
    minify: 'esbuild'
  }
})
