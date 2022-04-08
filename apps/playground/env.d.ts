/// <reference types="vite-plugin-pages/client" />

declare module 'log-*' {
  import { PluginObject } from 'vue';

  const a: PluginObject;
  export default a;
}
