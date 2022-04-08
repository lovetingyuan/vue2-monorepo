<template>
  <div class="page" data-page>
    <slot v-if="error" name="page-fallback">
      <h4 style="text-indent: 2em;">
        页面发生错误，请
        <a href="javascript:location.reload()" style="color:cornflowerblue">刷新重试</a>。
      </h4>
    </slot>
    <div v-else-if="!renderer">
      <slot name="page-loading">
        <div class="el-loading-mask is-fullscreen">
          <div class="el-loading-spinner">
            <svg viewBox="25 25 50 50" class="circular">
              <circle
                cx="50"
                cy="50"
                r="20"
                fill="none"
                class="path"
              />
            </svg>
            <p class="el-loading-text">
              正在加载...
            </p>
          </div>
        </div>
      </slot>
    </div>
    <component
      :is="renderer"
      v-else
      :ui-config="myUIConfig"
      :meta-config="myMetaConfig"
      @error="error = true"
    >
      <template v-for="name of slots" :slot="name" slot-scope="scope">
        <slot :name="name" v-bind="scope" />
      </template>
    </component>
  </div>
</template>

<script>
import {
  getMetaConfig, getHornConfig, insertLoadingCss, loadRenderer
} from './utils'

insertLoadingCss()

export default {
  name: 'MayaPage',
  props: {
    localConfig: {
      required: true,
      type: Object,
    },
    metaConfig: {
      type: [Object, Function],
      required: false
    },
    hornKey: {
      type: String,
      required: false
    },
    metaKey: {
      type: String,
      required: false
    },
  },
  data() {
    return {
      renderer: null,
      error: false,
      myUIConfig: null,
      myMetaConfig: null
    }
  },
  computed: {
    slots() {
      return Object.keys({
        ...this.$slots,
        ...this.$scopedSlots
      }).filter(s => !s.startsWith('page-'))
    }
  },
  created() {
    Promise.all([
      this.loadUIConfig(),
      this.loadMetaConfig()
    ]).then(([ui, meta]) => {
      this.myUIConfig = typeof ui === 'string' ? ui : JSON.stringify(ui);
      this.myMetaConfig = typeof meta === 'string' ? meta : JSON.stringify(meta);
      return loadRenderer(ui.version);
    }).then(res => {
      this.renderer = res.Renderer;
      this.$nextTick(() => this.$emit('rendered'))
    }).catch(err => {
      this.error = true;
      if (import.meta.env.DEV) {
        console.error('[page] error: ', err)
      }
      throw err
    })
  },
  methods: {
    async loadUIConfig() {
      if (import.meta.env.DEV) {
        return this.localConfig;
      }
      if (!this.hornKey) {
        return this.localConfig;
      }
      const config = await getHornConfig({ module: this.hornKey, env: this.$options.env })
      return config || this.localConfig;
    },
    loadMetaConfig() {
      if (this.metaKey) {
        return getMetaConfig(this.metaKey)
      }
      if (this.metaConfig) {
        if (typeof this.metaConfig === 'function') {
          return this.metaConfig()
        }
        return this.metaConfig
      }
      return null
    }
  }
}
</script>
