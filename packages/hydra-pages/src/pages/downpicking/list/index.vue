<template>
  <maya-page :local-config="config" :horn-key="hornKey" />
</template>

<script>
import { SearchProTable } from '@yxfe/hydra-ui';
import config from './rdc_down_picking_list.config'
import shareConfig from './xtc_down_picking_list.config'

export default {
  // eslint-disable-next-line vue/no-unused-components
  components: { SearchProTable },
  props: {
    xtc: Boolean,
    poiId: {
      type: [String, Number], default: ''
    }
  },
  data() {
    return {
      config: this.xtc ? shareConfig : config,
      // poiId: this.poiId,
      apiPrefix: this.xtc ? '/api/m/xt' : '/api/m',
      hornKey: this.xtc ? 'xtc_down_picking_list' : 'rdc_down_picking_list'
    }
  },
  methods: {
    fetchTable(paging, searchParams) {
      // /inventory/rule/query/attribute/data/list
      return this.$hPost(`${this.apiPrefix}/inventory/rule/query/data/list`, {
        paging,
        poiId: this.poiId,
        ...searchParams,
        isXtcRepo: this.xtc ? 1 : 0,
        upOrDown: 2 // 1 上架， 2 下架
      }).then(res => {
        return {
          data: (res.rules || []).map(val => {
            // eslint-disable-next-line no-param-reassign
            val.poiList = val.poiList.map(v => v.label).join(',')
            return val
          }),
          total: res.total
        }
      })
    },
    switchRule(row, table) {
      const action = row.statusName === '有效' ? 'disable' : 'enable'
      this.$hPost(`${this.apiPrefix}/inventory/rule/${action}`, {
        ruleNo: row.ruleNo
      }).then(() => {
        table.reload();
      })
    },
    deleteRule(row, table) {
      this.$hPost(`${this.apiPrefix}/inventory/rule/deleteRule`, {
        ruleNo: row.ruleNo
      }).then(() => {
        table.reload();
      })
    }
  }
}
</script>
