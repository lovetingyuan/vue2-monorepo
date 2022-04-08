<template>
  <p>
    {{ a }}
    <button @click="count++">
      count: {{ count }}
    </button>
  </p>
</template>

<script>
export default {
  data() {
    return {
      a: 'this is a',
      count: 0
    }
  },
  methods: {
    aa() {
      return 'aa'
    }
  }
}
</script>
