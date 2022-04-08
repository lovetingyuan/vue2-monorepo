import type { PluginFunction } from 'vue'
import SearchProTable, { type SearchProTableProps } from './components/search-table'
import Text from './components/text'
import FormPoiSelect from './components/form-poi-select'
import FormEditableTable from './components/form-editable-table'
import FormSelector from './components/form-selector'
import { version } from './package.json'

const install: PluginFunction<never> = (vue) => {
  [SearchProTable, Text, FormPoiSelect, FormEditableTable, FormSelector].forEach((comp: any) => {
    if (comp.install) {
      comp.install(vue)
    } else if (typeof comp === 'function' && comp.options) {
      vue.component(comp.options.name, comp)
    } else if (typeof comp === 'object' && comp.name) {
      vue.component(comp.name, comp)
    }
  })
}

export {
  SearchProTable, Text, FormPoiSelect, FormEditableTable, FormSelector
}

export type {
  SearchProTableProps
}

export default {
  install,
  version,
}
