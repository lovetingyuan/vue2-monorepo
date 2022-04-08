import { defineConfig } from 'vite'
import { fileURLToPath } from 'url'
import { createVuePlugin as vue2 } from 'vite-plugin-vue2'
import path from 'path'
import { peerDependencies } from './package.json'
import buildPages from './plugins/vite-build-pages'
import publishConfigs from './plugins/vite-publish-configs'

const root = fileURLToPath(new URL('./', import.meta.url))

export default defineConfig({
  plugins: [
    vue2({
      jsx: true,
    }),
    publishConfigs(),
    buildPages(),
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
      '@': path.join(root, 'src')
    },
  }
})
