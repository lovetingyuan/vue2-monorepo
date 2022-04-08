<template>
  <pro-table ref="table" :async-data="asyncData" class="maya-search-pro-table">
    <template #filter>
      <pro-table-filter
        v-model="formData"
        v-bind="filterProps"
        :max-size="6"
        inline
        class="maya-table-filter"
      >
        <template v-for="item of filters2">
          <form-field
            v-if="item.field"
            :key="'_filed' + item.prop"
            :prop="item.prop"
            :label="item.label"
          >
            <component :is="item.type" v-bind="item.props" v-model="formData[item.prop]" />
          </form-field>
          <component
            :is="item.type"
            v-else-if="!item.slot"
            :key="item.prop"
            :prop="item.prop"
            :label="item.label"
            v-bind="item.props"
          />
          <form-group v-else :key="item.slot">
            <slot :name="item.slot" :form-data="formData" />
          </form-group>
        </template>
        <template v-if="filterButtons" #submitter>
          <mtd-button
            v-for="(button, i) of filterButtons"
            :key="'submitter' + i"
            type="primary"
            @click="button.click(formData)"
          >
            {{ button.text }}
          </mtd-button>
        </template>
      </pro-table-filter>
    </template>
    <template v-if="buttons" #toolbar>
      <mtd-button
        v-for="(button, i) of buttons"
        :key="'toolbar' + i"
        type="primary"
        :style="button.style"
        @click="button.click(formData)"
      >
        {{ button.text }}
      </mtd-button>
    </template>
    <template #default>
      <pro-table-column
        v-for="column of columns"
        :key="column.prop"
        :prop="column.prop"
        :label="column.label"
        :config="column.config"
        v-bind="column.props"
      >
        <template v-if="column.buttons || column.format" #default="scope">
          <span v-if="column.format" v-html="column.format(scope)" />
          <template v-else>
            <template v-for="(button, i) of column.buttons">
              <!-- <mtd-button
                v-if="button.link"
                type="text-primary"
                size="small"
                @click="linkTo(button.click(scope))"
                :disabled="button.disabled ? button.disabled(scope) : false"
              >{{ button.text }}</mtd-button>-->
              <mtd-popconfirm
                v-if="button.confirm && (button.visible ? button.visible(scope) : true)"
                :key="'confirm' + i"
                placement="top"
                :message="typeof button.confirm === 'function' ? button.confirm(scope) : button.confirm"
                @ok="button.click(scope)"
              >
                <mtd-button
                  type="text-primary"
                  size="small"
                  :disabled="button.disabled ? button.disabled(scope) : false"
                >
                  {{ typeof button.text === 'function' ? button.text(scope) : button.text }}
                </mtd-button>
              </mtd-popconfirm>
              <mtd-button
                v-else-if="(button.visible ? button.visible(scope) : true)"
                :key="'table-button' + i"
                type="text-primary"
                size="small"
                :disabled="button.disabled ? button.disabled(scope) : false"
                @click="button.click(scope)"
              >
                {{ typeof button.text === 'function' ? button.text(scope) : button.text }}
              </mtd-button>
            </template>
          </template>
          <!-- <slot v-if="column.slot" :name="column.slot" v-bind="scope"></slot> -->
        </template>
      </pro-table-column>
    </template>
  </pro-table>
</template>

<script>

export default {
  name: 'SearchProTable',
  props: {
    filterProps: {
      type: Object, required: false
    },
    filters: {
      type: Array, required: true
    },
    filterButtons: {
      type: Array, required: false
    },
    fetchTable: {
      type: Function, required: true
    },
    buttons: {
      type: Array, required: false
    },
    columns: {
      type: Array, required: true
    }
  },
  data() {
    const formData = {};
    const filters2 = this.filters.map(item => {
      if ('prop' in item) {
        const { prop, default: defaultValue = null } = item
        formData[prop] = defaultValue
      }
      // if (!item.props) {
      //   item.props = {}
      // }
      // if (!item.props.placeholder) {
      //   if (item.type === 'form-item') {
      //     item.props.placeholder = '请输入' + item.label;
      //   }
      //   if (item.type === 'form-select') {
      //     item.props.placeholder = '请选择' + item.label;
      //   }
      // }
      // console.log(9, item)
      return item
    })
    return {
      formData,
      filters2
    }
  },
  methods: {
    linkTo(url) {
      this.$tools.linkTo(url);
    },
    reload() {
      if (this.$refs.table) {
        this.$refs.table.reload()
      }
    },
    asyncData({ pageSize, pageNo }) {
      return this.fetchTable(
        { limit: pageSize, offset: (pageNo - 1) * pageSize },
        this.formData
      )
    }
  }
}
</script>

<style scoped>
/* .maya-table-filter ::v-deep .mtd-btn-primary.mtd-btn-ghost {
  background: #0a70f5;
  color: white;
} */
.maya-search-pro-table ::v-deep .mvp-pro-table-header {
  border-bottom: 5px solid #f5f5f5;
}
.maya-search-pro-table ::v-deep .mvp-pro-table-header {
  padding: 20px 0;
}
.maya-search-pro-table ::v-deep .mtd-table-header thead th {
  padding: 12px 0;
}
</style>

<doc>
::: example title ./doc/a.vue
:::
</doc>
