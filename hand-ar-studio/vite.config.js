import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Without this config the React/JSX plugin is never registered, so `npm run dev`
// and `npm run build` fail to transform the .jsx files. It is required.
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
  build: {
    target: 'es2019',
    chunkSizeWarningLimit: 1500,
  },
});
