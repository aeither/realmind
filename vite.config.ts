import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    viteTsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    tailwindcss(),
    // Set customViteReactPlugin to true
    tanstackStart({ customViteReactPlugin: true }),
    // Add the official Vite React plugin
    react(),
  ],
  server: {
    allowedHosts: true,
    proxy: {
      '/.well-known/farcaster.json': {
        target: 'https://basically-enough-clam.ngrok-free.app/.well-known/farcaster.json',
        changeOrigin: true,
        rewrite: () => '',
        configure: (proxy) => {
          proxy.on('proxyRes', (proxyRes) => {
            // Set 307 temporary redirect status
            proxyRes.statusCode = 307
          })
        }
      }
    }
  },
})
