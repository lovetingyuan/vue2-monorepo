<template>
  <div>this is a demo component</div>
</template>

<script>
export default {
  name: 'Demo',
  props: {
    // a 是一个属性
    a: {
      type: String,
      default: ''
    }
  },
  methods: {
    /**
     * @vuese
     * b 是一个方法
     * @arg foo 表示参数
     */
    b(foo = false) {
      return foo
    }
  },
}
</script>

<doc>
This is a demo component.

::: example aaa ./doc/a.vue
:::

::: example bbb ./doc/b.vue
:::

::: tip
 you can use all vitepress markdown syntax.
:::
</doc>
