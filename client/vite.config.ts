import { UserConfigExport, ConfigEnv, defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path';
import mockDevServerPlugin from 'vite-plugin-mock-dev-server'

// https://vitejs.dev/config/
export default ({ command }: ConfigEnv): UserConfigExport => defineConfig({
  plugins: [
    react(),
    //mockDevServerPlugin(),
  ],
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\api/, '')
      },
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
})
