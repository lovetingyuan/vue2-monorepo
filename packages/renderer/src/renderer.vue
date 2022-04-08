<template>
  <div data-renderer class="renderer">
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
        v-model="$parent.$parent.configYard.model[comp.model]"
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
import { version } from '../package.json'

const getQuery = (search) => {
  const params = new URLSearchParams(search || window.location.search);
  const query = {};
  params.forEach((v, k) => {
    query[k] = v;
  });
  return query;
};

export default {
  /** @type {string} */
  version,
  props: {
    config: {
      type: String,
      required: true
    },
  },
  data() {
    const config = JSON.parse(this.config)
    this.refs = {}
    this.query = getQuery()
    const parent = this.$parent.$parent;
    if (!parent.configYard.model) {
      parent.$set(parent.configYard, 'model', {})
    }

    Object(config.components || []).forEach((comp) => {
      if (typeof comp.type === 'string' && parent.$options.components[comp.type]) {
        // 优先使用局部注册组件
        this.$options.components[comp.type] = parent.$options.components[comp.type]
      }
      if (comp.model) {
        parent.$set(parent.configYard.model, comp.model, comp.defaultValue)
      }
      if (comp.ref) {
        Object.defineProperty(this.refs, comp.ref, {
          get: () => this.$refs?.[comp.ref]?.[0]
        })
      }
    })
    const conf = this.config
      .replace(/":"\{\{(.+?)\}\}"(,|\})/g, (s, e, t) => `":(${e.replace(/\\"/g, '"')})${t}`)
    // eslint-disable-next-line no-new-func
    this.renderConfigFunc = new Function('$', 'query', 'refs', 'model', `return ${conf}`)
    return {
      rendered: false,
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
      const parent = this.$parent.$parent;
      const config = this.renderConfigFunc(parent, this.query, this.refs, parent.configYard.model)
      if (!this.rendered) { // for get refs
        // eslint-disable-next-line vue/no-async-in-computed-properties
        this.$nextTick(() => { this.rendered = true })
      }
      config.components = config.components.filter(comp => {
        return 'isVisible' in comp ? comp.isVisible : true
      })
      return config
    }
  },
  errorCaptured(err) {
    this.$emit('error', err)
  },
}
</script>
