<template>
  <DownPickingDetail
    v-if="isXtcRepo"
    :is-xtc-repo="true"
    :poi-id="143266102329955"
  />
  <DownPickingDetail v-else :is-rdc-repo="true" />
</template>

<script>
import DownPickingDetail from '@yxfe/hydra-pages/downpicking/detail'

export default {
  components: { DownPickingDetail },
  data() {
    return {
      // eslint-disable-next-line eqeqeq
      isXtcRepo: this.$tools.search('isXtcRepo') == 1,
    }
  }
}
</script>
