import { defineConfig } from 'vite'
import { createVuePlugin as vue2 } from 'vite-plugin-vue2'
import { resolve } from 'path'
import injectCSSPlugin from 'vite-plugin-inject-css'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue2({
      jsx: true,
    }),
    injectCSSPlugin(),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, './index.ts'),
      name: 'ConfigPage',
      fileName: (format) => `config-page.${format}.js`,
    },
    cssCodeSplit: true,
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: ['vue'],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
})
