<template>
  <form-field v-bind="$attrs">
    <template #default="scope">
      <log-poi-select
        :key="'my_poi_select' + poiTypeCustom"
        v-bind="{...$attrs, ...myAttrs}"
        v-model="scope.model[prop]"
        :disabled="scope.readonly || scope.disabled"
        :class="scope.readonly ? 'my_poi_select' : ''"
        v-on="$listeners"
      />
    </template>
  </form-field>
</template>

<script>
export default {
  name: 'MyFormPoiSelect',
  props: {
    poiTypeCustom: { type: [Number, String], default: 0 },
    prop: {
      required: true, type: String
    }
  },
  computed: {
    myAttrs() {
      // 中心仓
      if (this.poiTypeCustom === 2) {
        return {
          businessTypeList: [1]
        }
      }
      //  协同仓
      if (this.poiTypeCustom === 6) {
        return {
          businessTypeList: [3]
        }
      }
      //  加工仓
      if (this.poiTypeCustom === 7) {
        return {
          businessTypeList: [2]
        }
      }
      // 自动化仓
      if (this.poiTypeCustom === 101) {
        return {
          businessTypeList: [1],
          poiApiParams: {
            attributeType: {
              auto_warehouse: 1
            }
          }
        }
      }
      return {}
    }
  }
}
</script>

<style scoped>
::v-deep .log-ui-poi-select .mtd-input-wrapper{
 width: 360px
}
::v-deep .log-ui-poi-select.my_poi_select .mtd-input-readonly {
    opacity: 1;
}
::v-deep .log-ui-poi-select.my_poi_select .mtd-input-readonly input{
    border: none;
    background: none;
    padding: 0
}
</style>
