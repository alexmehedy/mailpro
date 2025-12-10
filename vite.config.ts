import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // This allows access to process.env.API_KEY in the browser for this specific demo setup
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
  }
});