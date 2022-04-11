import type { PluginObject } from 'vue'
import Page from './src/page.vue'

const core: PluginObject<{
  env: 'production' | 'test' | 'development';
}> = {
  install(vue, options) {
    Object.assign(Page, options || {})
    if (vue.component(Page.name)) {
      if (import.meta.env.DEV) {
        console.warn('core can not be used more than once.')
      }
      return
    }

    // eslint-disable-next-line no-param-reassign
    vue.config.errorHandler = function errorHandler(err, vm, info) {
      if (import.meta.env.DEV) {
        console.error('[core] CONFIGURATION_ERROR: ', err, vm, info)
      }
    }

    // eslint-disable-next-line no-param-reassign
    vue.config.warnHandler = function warnHandler(err, vm, info) {
      if (import.meta.env.DEV) {
        console.warn('[core] CONFIGURATION_WARN: ', err, vm, info)
      }
    }

    vue.mixin({
      data() {
        return {
          configYard: {},
        }
      },
    })
    vue.component(Page.name, Page)
  },
}

export default core
