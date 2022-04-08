import type { PluginObject } from 'vue'
import Page from './src/page.vue'
import { reportError } from './src/utils'

const core: PluginObject<{
  env: 'production' | 'test' | 'development'
}> = {
  install(vue, options) {
    if (!options) {
      throw new Error('@yxfe/maya-core install requires options')
    }
    Object.assign(Page, options)
    if (vue.component(Page.name)) {
      if (import.meta.env.DEV) {
        console.warn('@yxfe/maya-core can not be used more than once.')
      }
      return;
    }

    // eslint-disable-next-line no-param-reassign
    vue.config.errorHandler = function (err, vm, info) {
      if (import.meta.env.DEV) {
        console.error('[maya-core] CONFIGURATION_ERROR: ', err, vm, info);
      } else {
        reportError('CONFIGURATION_ERROR', err);
      }
    };

    // eslint-disable-next-line no-param-reassign
    vue.config.warnHandler = function (err, vm, info) {
      if (import.meta.env.DEV) {
        console.warn('[maya-core] CONFIGURATION_WARN: ', err, vm, info);
      } else {
        // reportError('CONFIGURATION_ERROR', err);
      }
    };

    vue.mixin({
      data() {
        return {
          maya: {} // 用于组件的双向绑定
        }
      }
    })
    vue.component(Page.name, Page)
  }
}

export default core
