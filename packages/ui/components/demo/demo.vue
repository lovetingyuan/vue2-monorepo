<template>
  <div>this is a demo component, and {{ message }}</div>
</template>

<script>
export default {
  name: 'Demo',
  props: {
    // message 是一个属性
    message: {
      type: String,
      default: 'hello'
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

::: example demo_a ./doc/a.vue
:::

::: tip
 you can use all vitepress markdown syntax.
:::
</doc>
