<template>
  <!-- vitepress不支持vue2，所以用iframe来展示vue2的组件 -->
  <iframe
    ref="iframe"
    title="组件示例"
    :src="iframeSrc"
    frameborder="0"
  />
</template>

<script lang="ts" setup>
import { ref, nextTick } from 'vue'

const props = defineProps<{
  title: string
  src: string
  port: number
}>()

const iframeSrc = ref('')

if (typeof window === 'object') {
  const params = new URLSearchParams()
  params.append('src', props.src)
  params.append('title', props.title || '代码')
  params.append('comp', `.${window.location.pathname.replace('.html', '.vue')}`)

  nextTick(() => { // ? SSR水合后并没有更新iframeSrc 不知道为什么
    if (import.meta.env.DEV) {
      iframeSrc.value = `http://localhost:${props.port}/?${params}`
    } else {
      iframeSrc.value = new URL(
        `${import.meta.env.BASE_URL}scene/index.html?${params}`,
        window.location.href.split('?')[0]
      ).toString()
    }
  });
}

</script>

<style scoped>
iframe {
  width: 100%;
  height: 100%;
  margin: 24px 0;
}
</style>
