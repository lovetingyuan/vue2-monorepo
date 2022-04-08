import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';
import { createVuePlugin as vue2 } from 'vite-plugin-vue2';
import { pagePlugin } from 'vite-plugin-pages';
import proxy from './proxy';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue2({
      jsx: true,
    }),
    pagePlugin({
      userProxy: proxy,
      defaultProxy: {},
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
