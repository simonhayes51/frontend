import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const port = parseInt(process.env.PORT) || 8080;

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port,
  },
  preview: {
    host: '0.0.0.0',
    port,
  },
  build: {
    outDir: 'dist', // ✅ Required for Railway to find static files
  },
});