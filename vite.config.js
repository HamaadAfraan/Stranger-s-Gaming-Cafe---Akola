import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    host: true, 
    port: 5173,
    maxHttpHeaderSize: 1048576,
    allowedHosts: [
      'handiwork-pegboard-rebuild.ngrok-free.dev',
      '.ngrok-free.dev',
      '192.168.1.13', // 
    ],
  },
});