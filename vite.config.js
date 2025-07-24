import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080', // your backend
        changeOrigin: true
        //rewrite: (path) => path.replace(/^\/api/, ''),
      },

      '/ml': {
        target: 'http://localhost:8000', // your backend
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ml/, ''),
      },
    },
  },
});