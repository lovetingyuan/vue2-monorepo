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

<style scoped>
div {
  font-style: italic;
}
</style>

<doc>
This is a demo component.

::: example ./doc/a.vue demo a
this is demo a

* dsf
* dsffas

`dsdf`

:::

::: example ./doc/b.vue demo b
:::

::: tip
 you can use all vitepress markdown syntax.
:::
</doc>
