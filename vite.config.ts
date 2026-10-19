import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: { outDir: 'dist', sourcemap: true },
  envDir: '.',
  server: { port: 5173 },
  // API base URL is env-driven via VITE_API_URL; no hard-coded proxy
});
