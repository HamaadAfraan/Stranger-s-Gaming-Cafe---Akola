import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    maxHttpHeaderSize: 1048576,
    proxy: {
      '/supabase': {
        target: 'https://ftpcjyecegugofftcoco.supabase.co',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/supabase/, ''),
        ws: true, // WebSocket connections support ke liye
      },
    },
  },
})