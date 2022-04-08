<template>
  <div data-renderer class="renderer">
    <h3 v-if="renderConfig.title" class="page-title">
      {{ renderConfig.title }}
    </h3>
    <template v-for="(comp, i) of renderConfig.components">
      <component
        :is="comp.type"
        v-if="comp.html"
        :key="(comp.key || (comp.type + i)) + 'html'"
        :ref="comp.ref"
        v-html="comp.html"
      />
      <component
        :is="comp.type"
        v-else
        :key="comp.key || (comp.type + i)"
        :ref="comp.ref"
        v-bind="comp.props"
        v-model="$parent.$parent.maya.model[comp.model]"
        v-on="comp.events"
      >
        <!-- <template :slot="name" slot-scope="scope" v-for="name of slots">
          <slot :name="name" v-bind="scope"></slot>
        </template>-->
        <template v-for="(slot, j) of comp.slots">
          <template v-if="slots.includes(slot.name)">
            <slot :name="slot.name" />
          </template>
          <template v-if="('isVisible' in slot ? slot.isVisible : true)">
            <template v-if="!slot.name">
              <component
                :is="slot.type"
                v-if="slot.html"
                :ref="comp.ref"
                v-bind="slot.props"
                :key="'_slot' + j"
                v-on="slot.events"
                v-html="slot.html"
              />
              <component
                :is="slot.type"
                v-else
                :ref="comp.ref"
                v-bind="slot.props"
                :key="'_slot_' + j"
                v-on="slot.events"
              />
            </template>
            <template v-else :slot="slot.name">
              <component
                :is="slot.type"
                v-if="slot.html"
                :ref="comp.ref"
                v-bind="slot.props"
                :key="'_slot' + slot.name"
                v-on="slot.events"
                v-html="slot.html"
              />
              <component
                :is="slot.type"
                v-else
                :ref="comp.ref"
                v-bind="slot.props"
                :key="'_slot_' + slot.name"
                v-on="slot.events"
              />
            </template>
          </template>
        </template>
      </component>
    </template>
  </div>
</template>

<script>
// import { cloneDeep } from 'lodash-es';
import { getDefaultValue, getQuery } from './utils'
import { version } from '../package.json'

export default {
  name: 'MyRenderer',
  /** @type {string} */
  version,
  props: {
    uiConfig: {
      type: String,
      required: true
    },
    metaConfig: {
      type: String,
      required: false,
      default: 'null'
    }
  },
  data() {
    const uiConfig = JSON.parse(this.uiConfig)

    // 转换元数据的 selectable:false => disabled:true
    const metaConfigTrans = this.metaConfig.replace(/"selectable":\s*false/g, '"disabled": true');

    const metaConfig = JSON.parse(metaConfigTrans)
    const mergedUIConfig = this.concatConfig(uiConfig, metaConfig);
    this.refs = {}
    this.query = getQuery()
    const parent = this.$parent.$parent;
    if (!parent.maya.model) {
      parent.$set(parent.maya, 'model', {})
    }

    Object(uiConfig.components || []).forEach((comp) => {
      if (typeof comp.type === 'string' && parent.$options.components[comp.type]) {
        // 优先使用局部注册组件
        this.$options.components[comp.type] = parent.$options.components[comp.type]
      }
      if (comp.model) {
        const defaultValue = comp.defaultValue || getDefaultValue(comp.valueType);
        parent.$set(parent.maya.model, comp.model, defaultValue)
      }
      if (comp.ref) {
        Object.defineProperty(this.refs, comp.ref, {
          get: () => this.$refs?.[comp.ref]?.[0]
        })
      }
    })
    const conf = JSON.stringify(mergedUIConfig)
      .replace(/":"\{\{(.+?)\}\}"(,|\})/g, (s, e, t) => `":(${e.replace(/\\"/g, '"')})${t}`)
    // eslint-disable-next-line no-new-func
    this.renderConfigFunc = new Function('$', 'query', 'refs', 'model', `return ${conf}`)
    return {
      rendered: false,
      ruleMap: {}
      // mergedUIConfig
    }
  },
  computed: {
    slots() {
      return Object.keys({
        ...this.$parent.$slots,
        ...this.$parent.$scopedSlots
      })
    },
    renderConfig() {
      if (import.meta.env.DEV) {
        console.log('[renderer] get renderConfig');
      }
      try {
        const parent = this.$parent.$parent;
        const config = this.renderConfigFunc(parent, this.query, this.refs, parent.maya.model)
        if (!this.rendered) { // for get refs
          // eslint-disable-next-line vue/no-async-in-computed-properties
          this.$nextTick(() => { this.rendered = true })
        }
        config.components = config.components.filter(comp => {
          return 'isVisible' in comp ? comp.isVisible : true
        })
        return config
      } catch (err) {
        this.$emit('error', err)
        throw err
      }
    }
  },
  errorCaptured(err) {
    this.$emit('error', err)
  },
  methods: {
    concatConfig(uiConfig, metaConfig) {
      if (!metaConfig || !metaConfig.metaAttrs) { return uiConfig; }

      // 从元数据生成校验规则
      this.ruleMap = this.getRuleMap(metaConfig);

      uiConfig.components.forEach((component) => {
        this.concatProp(component, metaConfig);
        if (component.slots) {
          component.slots.forEach((slot) => {
            this.concatProp(slot, metaConfig);
          })
        }
      })
      if (import.meta.env.DEV) {
        console.error(JSON.stringify(metaConfig, null, 2))
        console.error(JSON.stringify(uiConfig, null, 2));
      }

      return uiConfig;
    },

    concatProp(comp, metaConfig) {
      const component = comp;
      if (component.attributeName) {
        const obj = metaConfig.metaAttrs.find((meta) => meta.name === component.attributeName)
        if (obj) {
          if (!component.props) { component.props = {}; }

          // ** component.props.requireMeta ** 需要绑定元数据到组件上供组件消费
          if (component.props.requireMeta) { component.props.metadata = obj; }

          component.props.entityId = metaConfig.entityId;
          component.props.attributeId = obj.metaAttributeId;
          component.props.label = obj.cnname;
          component.props.prop = obj.name;
          component.props.required = obj.required;

          if (obj.options) {
            // 将后端的 option.value string 转为 数字
            if (obj.valueType === 'integer') {
              obj.options.forEach(option => {
                // eslint-disable-next-line no-param-reassign
                option.value = +option.value;
              })
            }
            component.props.options = obj.options;
          }

          if (obj.optionRelationNames && Array.isArray(obj.optionRelationNames)) {
            // 动态数据集 有依赖
            if (obj.optionRelationNames.length) {
              let str = '{{ {'
              obj.optionRelationNames.forEach((item) => {
                const val = component.props.parentModel ? `model.${component.props.parentModel}.${item}` : `model.${item}`
                str += `${item}: ${val}, `
              })
              str += '} }}'
              component.props.optionRelationNames = str;
              // 动态数据集 无依赖
            } else {
              component.props.getMetaOptionsDirect = true;
            }
          }
        } else {
          component.isVisible = false;
        }
      }

      // ** component.props.requireRules ** 组件挂载 rules(只处理一层)
      if (component.props && component.props.requireRules && component.slots) {
        const keys = component.slots.map(c => c.attributeName).filter(item => !!item);
        component.props.rules = component.props.rules || {};
        keys.forEach(key => {
          component.props.rules[key] = this.ruleMap[key] || {};
        })
      }

      return component;
    },

    getRuleMap(metaConfig) {
      const ruleMap = {};
      metaConfig.metaAttrs.forEach(meta => {
        ruleMap[meta.name] = []

        // 正则判断
        if (meta.pattern) {
          ruleMap[meta.name].push({
            pattern: `{{ new RegExp('${meta.pattern}') }}`,
            message: meta.patternErrorMessage || '不符合规则'
          })
        }

        // TODO 其他校验规则
      })
      return ruleMap;
    }
  }
}
</script>
