<template>
  <iframe v-if="src" :title="title" :src="src" hidden frameborder="0" />
</template>

<script lang="ts" setup>
const props = defineProps<{
  port: number;
  title: string;
}>();
let src = '';
if (import.meta.env.DEV) {
  src = `http://localhost:${props.port}/?comp=${encodeURIComponent(
    `.${window.location.pathname.replace('.html', '.vue')}`
  )}`;
}
</script>
