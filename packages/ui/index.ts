import type { PluginFunction } from 'vue';
import { version } from './package.json';
import Demo from './components/demo/demo.vue';

const install: PluginFunction<never> = (vue) => {
  [Demo].forEach((comp: any) => {
    if (comp.install) {
      comp.install(vue);
    } else if (typeof comp === 'function' && comp.options) {
      vue.component(comp.options.name, comp);
    } else if (typeof comp === 'object' && comp.name) {
      vue.component(comp.name, comp);
    }
  });
};

export default {
  install,
  version,
};
