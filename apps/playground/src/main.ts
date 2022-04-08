import Vue from 'vue'
import Page from '@page'

import '@ss/mtd-vue/lib/theme2/index.css'
import MTD from '@ss/mtd-vue'
import '@mt-material/mtd-vue-pro/lib/theme-chalk/index.css'
import mvp from '@mt-material/mtd-vue-pro'

import MayaCore from '@yxfe/maya-core'
import requestInit from '@yxfe/request';
import * as tools from '@yxfe/tools';
import logPoiSelect from '@yxfe/log-poi-select';

Vue.use(MTD)
Vue.use(mvp)
Vue.use(MayaCore, { env: 'development' })
Vue.use(logPoiSelect);

// 替换请求库为 @yxfe/request
const { get, post } = requestInit({
  devMode: true,
  ignoredUrls: ['logan.plat.test.sankuai.com', 'logan.sankuai.com'],
});

Vue.prototype.$hGet = get;
Vue.prototype.$hPost = post;
Vue.prototype.$tools = tools;

Vue.config.productionTip = false

// eslint-disable-next-line no-new
new Vue({
  el: '#app',
  render: (h) => h(Page),
})

// window.addEventListener('unhandledrejection', err => {
//   console.error(9, err)
// })

// window.addEventListener('error', err => {
//   console.error(7, err)
// })
