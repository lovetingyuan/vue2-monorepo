<template>
  <form-field
    v-bind="$attrs"
    label=""
    :prop="prop"
    :rules="myRules"
  >
    <editable-table
      :data.sync="myData"
      v-bind="myTableConfig"
      :columns="myColumnsConfigs"
    />
  </form-field>
</template>

<script>
/* eslint-disable no-param-reassign */

import { cloneDeep, isEqual } from 'lodash-es';

export default {
  name: 'MyFormEdiatbleTable',
  props: {
    tableConfig: { required: true, type: Object },
    columnsConfigs: { required: true, type: Array },
    metadata: { required: true, type: Object },
    entityId: { required: true, type: [String, Number] },
    attributeId: { required: true, type: [String, Number] },
    parentModel: { required: true, type: Object },
    prop: { required: true, type: String },
  },
  data() {
    return {
      myData: [],
      myTableConfig: {},
      myColumnsConfigs: [],
      optionsMap: {},
      watcherIndexArr: [],
      isMultipleAndAllIndex: -1,
    }
  },
  computed: {
    myRules() {
      return {
        validator: async (rule, arr, callback) => {
          if (!arr || !arr.length) {
            return callback('不可为空');
          }

          // 必须全选？
          this.myColumnsConfigs.forEach((column) => {
            if (column.isMultipleAndAll) {
              // eslint-disable-next-line consistent-return
              arr.forEach((item, index) => {
                const data = item[column.prop];
                let arr1 = [];
                if (Array.isArray(data)) {
                  arr1 = (cloneDeep(data)).sort()
                }
                const val = item[column.optionsWatcher];
                const multipleVals = column.isMultipleAndAll[column.optionsWatcher];
                if (multipleVals.includes(val)) {
                  const options = cloneDeep(this.optionsMap[val] || []);
                  const expected = options.map(i => i.value);
                  const arr2 = expected.sort();
                  if (!isEqual(arr1, arr2)) {
                    return callback(`第 ${index + 1} 行${column.label} 必须全选`)
                  }
                }
              })
            }
          })

          return callback()
        }
      }
    }
  },
  watch: {
    myData() {
      this.tableConfig.setModel(this.myData);
    },
    'tableConfig.dataSync'() {
      const myData = this.tableConfig.dataSync;
      this.myData = myData;

      // TODO 应该加上 dobounce 触发变化
      if (myData && myData.length) {
        this.myColumnsConfigs.forEach(column => {
          // 当前变化会触发别的字段的 options 变化
          if (column.optionsTrigger) {
            myData.forEach(columnData => {
              // key 当前 key， value 当前value
              this.setOptions({ key: column.prop, value: columnData[column.prop], trigger: column.optionsTrigger });
            })
          }
        })
      }
    },
  },
  created() {
    this.myTableConfig = this.tableConfig;
    this.myColumnsConfigs = this.columnsConfigs;

    if (this.metadata && this.metadata.children) {
      this.myColumnsConfigs.forEach((column, columnIndex) => {
        const metaItem = this.metadata.children.find(i => i.name === column.prop);
        if (metaItem) {
          column.label = metaItem.cnname;
          column.attributeId = metaItem.metaAttributeId;
          column.config.options = metaItem.options;
          column.valueType = metaItem.valueType;

          this.myTableConfig.rules = this.myTableConfig.rules || {};
          this.myTableConfig.rules[column.prop] = this.myTableConfig.rules[column.prop] || [];

          if (metaItem.required) {
            this.myTableConfig.rules[column.prop].push({ required: true, message: '必填' });
          }

          if (metaItem.valueType === 'integer') {
            this.myTableConfig.rules = this.myTableConfig.rules || {};
            this.myTableConfig.rules[column.prop].push({ pattern: /^-?\d+$/, message: '必须为整数' });
            if (metaItem.minimum) {
              this.myTableConfig.rules[column.prop].push({
                validator(rule, value, callback) {
                  if (value && +value < metaItem.minimum) { callback(new Error(`不能小于 ${metaItem.minimum}`)); }
                  callback();
                }
              });
            }
            if (metaItem.maximum) {
              this.myTableConfig.rules[column.prop].push({
                validator(rule, value, callback) {
                  if (value && +value > metaItem.maximum) { callback(new Error(`不能大于 ${metaItem.maximum}`)); }
                  callback();
                }
              });
            }
          }

          if (metaItem.optionRelationNames) {
            column.optionRelationNames = metaItem.optionRelationNames;
          }

          // 当 optionsWatcher 的值变化时，当前的 options 依赖于他
          if (column.optionsWatcher) {
            const configRaw = typeof column.config === 'function' ? column.config : cloneDeep(column.config);
            column.config = (row) => {
              const op = this.optionsMap[row[column.optionsWatcher]] || [];
              let options = cloneDeep(op);
              const curValue = row[column.prop];

              // 当前选项是多选
              if (column.isMultipleAndAll) {
                // this.isMultipleAndAllIndex = columnIndex;
                const keys = Object.keys(column.isMultipleAndAll);
                keys.forEach(key => {
                  const val = row[key];
                  if (column.isMultipleAndAll[key].includes(val)) {
                    configRaw.multiple = true;
                    if (curValue && options && curValue.length === options.length) {
                      // console.error(JSON.stringify(options))
                      options = options.sort((a, b) => {
                        return curValue.indexOf(a.value) - curValue.indexOf(b.value);
                      });
                    }
                  } else {
                    configRaw.multiple = false;
                  }
                });
              }

              // 如果当前值不在数据集中 reset 下
              if (options && options.length > 0 && curValue) {
                const values = options.map(it => it.value);
                if (Array.isArray(curValue)) {
                  curValue.forEach(val => {
                    if (!values.includes(val)) {
                      row[column.prop] = ''
                    }
                  });
                } else if (curValue && !values.includes(curValue)) {
                  row[column.prop] = ''
                }
              }
              return {
                ...configRaw,
                options
              }
            }
            this.watcherIndexArr.push(columnIndex);
          }

          if (column.optionsTrigger) {
            column.config.event = {
              change: (value) => {
                this.setOptions({ key: column.prop, value, trigger: column.optionsTrigger });
              }
            }
          }

          if (column.uniqueItems) {
            this.myTableConfig.rules[column.prop].push({
              validator: (rule, value, callback) => {
                const { field } = rule;
                const arr = field.split('.');
                if (arr.length >= 3) {
                  const [, index, key] = arr;
                  // 编辑了自己撒
                  // eslint-disable-next-line eqeqeq
                  if (this.myData[index] && this.myData[index][key] == value) { return callback(); }
                }

                const values = this.myData.map(it => it[column.prop]) || [];
                values.forEach(it => {
                  // eslint-disable-next-line eqeqeq
                  if (value == it) {
                    callback(new Error(`${column.label}不能重复`));
                  }
                })
                return callback();
              }
            });
          }
        }
      })
    }
  },
  methods: {
    async fetchOptions(column, val) {
      const { optionRelationNames, attributeId } = column;
      try {
        const prefix = '/api/m/logistics/wms/metadataeav/dataset/dynamic'
        let url = `${prefix}?entityId=${this.entityId}&attributeId=${attributeId}`;
        if (optionRelationNames && optionRelationNames.length) {
          const temp = {};
          optionRelationNames.forEach(key => {
            temp[key] = (this.parentModel && this.parentModel[key]) || val;
          })
          url = `${url}&jsonStr=${JSON.stringify(temp)}`;
          const result = await this.$hGet(url);
          let list = [];
          if (result && result.list) {
            list = JSON.parse(result.list);
          }

          // 不可选
          list.forEach(option => {
            if (typeof option.selectable === 'boolean' && !option.selectable) {
            // eslint-disable-next-line no-param-reassign
              option.disabled = true;
            }
          })

          return Promise.resolve(list);
        }
      } catch (error) {
        console.error('fetchOptions error', error)
      }
      return [];
    },
    async setOptions(obj) {
      const index = this.myColumnsConfigs.findIndex(item => item.prop === obj.trigger);
      const column = this.myColumnsConfigs[index] || {};
      const options = await this.fetchOptions(column, obj.value)
      this.$nextTick(() => {
        this.$set(this.optionsMap, obj.value, options)
      })
    }
  }
};
</script>

<style></style>
