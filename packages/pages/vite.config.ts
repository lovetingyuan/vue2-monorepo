import { defineConfig } from 'vite'
import { fileURLToPath } from 'url'
import { createVuePlugin as vue2 } from 'vite-plugin-vue2'
import path from 'path'
import injectCSSPlugin from 'vite-plugin-inject-css'
import { peerDependencies } from './package.json'
import buildPages from './plugins/vite-build-pages'

const root = fileURLToPath(new URL('./', import.meta.url))

export default defineConfig({
  plugins: [
    vue2({
      jsx: true,
    }),
    buildPages(),
    injectCSSPlugin()
  ],
  build: {
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: Object.keys(peerDependencies),
    },
  },
  resolve: {
    alias: {
      '@': path.join(root, 'src'),
    },
  },
})
