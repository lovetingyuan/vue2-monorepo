<template>
  <div class="page" data-page>
    <slot v-if="error" name="page-fallback">
      <h4 style="text-indent: 2em">
        页面发生错误，请
        <a href="javascript:location.reload()" style="color: cornflowerblue">刷新重试</a>。
      </h4>
    </slot>
    <div v-else-if="!renderer">
      <slot name="page-loading">
        <Loading />
      </slot>
    </div>
    <component
      :is="renderer"
      v-else
      :config="uiConfig"
      @error="error = true"
    >
      <template v-for="name of slots" :slot="name" slot-scope="scope">
        <slot :name="name" v-bind="scope" />
      </template>
    </component>
  </div>
</template>

<script>
import { loadRenderer } from './utils'
import Loading from './loading.vue'

export default {
  name: 'ConfigPage',
  components: { Loading },
  props: {
    config: {
      required: true,
      type: Object,
    },
  },
  data() {
    return {
      renderer: null,
      error: false,
      uiConfig: '',
    }
  },
  computed: {
    slots() {
      return Object.keys({
        ...this.$slots,
        ...this.$scopedSlots,
      }).filter((s) => !s.startsWith('page-'))
    },
  },
  created() {
    const { version } = this.config
    loadRenderer(version)
      .then((res) => {
        this.renderer = res.Renderer
        this.uiConfig = JSON.stringify(this.config)
        this.$nextTick(() => this.$emit('rendered'))
      })
      .catch((err) => {
        this.error = true
        if (import.meta.env.DEV) {
          console.error('[core] error: ', err)
        }
      })
  }
}
</script>
