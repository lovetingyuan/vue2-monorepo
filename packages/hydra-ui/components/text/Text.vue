<template>
  <div :class="`my-${type}`">
    {{ content }}
    <slot />
  </div>
</template>

<script>
export default {
  name: 'MyText',
  props: {
    content: {
      type: String,
      default: '',
      required: true,
    },
    type: {
      type: String,
      default: 'text',
      required: false,
    },
  },
};
</script>

<style scoped>

.my-text {
  display: inline;
}

.my-h1 {
  display: block;
  font-size: 18px;
  font-weight: 600;
  position: relative;
  margin: 16px 0;
  line-height: 1.15;
}

.my-h1::before {
  content: "";
  position: absolute;
  border-left-style: solid;
  border-left-color: #4187ff;
  border-left-width: 4px;
  left: -10px;
  top: 1px;
  height: 18px;
  line-height: 1.15;
}
.my-h2 {
  display: block;
  font-weight: 600;
  font-size: 14px;
  margin: 16px 0;
  line-height: 1.15;
}
</style>
