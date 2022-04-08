import { fileURLToPath } from 'url'
import { defineConfig } from 'vite'
import { createVuePlugin as vue2 } from 'vite-plugin-vue2'
import { pagePlugin } from 'vite-plugin-pages'
import proxy from './proxy'

const DefaultTarget = 'https://manager.grocery.test.sankuai.com'
// const DefaultTarget = 'https://xt.grocery.test.sankuai.com'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue2({
      jsx: true
    }),
    pagePlugin({
      userProxy: proxy,
      defaultProxy: {
        '^/(api|shop|wai|api-wm|server|kit)/.*': DefaultTarget,
        '^/common/api/.*': DefaultTarget,
        '^/(product|store)-alias/thrift/.*': DefaultTarget,
        '^/poi-alias/(grid|poi)/.*': DefaultTarget,
      }
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  }
})
