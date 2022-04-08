<template>
  <form-select
    :prop="prop"
    :options="myOptions"
    :label="label"
    :required="required"
    v-bind="$attrs"
    v-on="$listeners"
  />
</template>

<script>
// import { isEqual } from 'lodash-es'

export default {
  name: 'MyFormSelector',
  props: {
    label: {
      type: String
    },
    required: {
      type: Boolean
    },
    options: {
      type: Array
    },
    getOptions: {
      type: Function
    },
    optionRelationNames: {
      type: Object,
      default: null,
      required: false
    },
    parentModel: {
    },
    entityId: {
      type: [String, Number],
      required: false
    },
    attributeId: {
      type: [String, Number],
      required: false
    },
    prop: {
      type: String,
      required: false
    },
    // 是否直接请求元数据 spi
    getMetaOptionsDirect: {
      type: Boolean,
      default: false,
    }
  },
  data() {
    return {
      myOptions: []
    }
  },
  watch: {
    optionRelationNames: {
      handler() {
        // if (!isEqual(cur, prev)) {
        this.getOptionsRelations();
        // }
      },
      deep: true
    }
  },
  mounted() {
    this.getOptionList()
  },
  methods: {
    async getOptionList() {
      this.myOptions = this.options || [];
      try {
        // 调用自定义方法
        if (this.getOptions) {
          this.myOptions = await this.getOptions();
          // 调用 元数据动态数据集方法
        } else if (this.getMetaOptionsDirect) {
          this.getOptionsRelations();
        }
      } catch (error) {
        console.error(error)
        this.$mtd.message.error(error.message);
      }
    },
    async getOptionsRelations() {
      const path = '/api/m/logistics/wms/metadataeav/dataset/dynamic'
      const prefix = `${path}?entityId=${this.entityId}&attributeId=${this.attributeId}`;
      const url = this.optionRelationNames ? `${prefix}&jsonStr=${JSON.stringify(this.optionRelationNames)}` : prefix;
      try {
        const data = await this.$hGet(url);
        const options = JSON.parse(data && data.list);
        // 不可选
        options.forEach(option => {
          if (typeof option.selectable === 'boolean' && !option.selectable) {
            // eslint-disable-next-line no-param-reassign
            option.disabled = true;
          }
        })
        this.myOptions = options;
      } catch (error) {
        console.error('getOptionsRelations error', error);
      }
    }
  }
}
</script>

<style>

</style>
