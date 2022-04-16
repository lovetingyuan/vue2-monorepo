import Vue from 'vue'
import Page from '@page'

import ConfigPage from 'config-page'

Vue.config.productionTip = false
Vue.use(ConfigPage)

// eslint-disable-next-line no-new
new Vue({
  el: '#app',
  render: (h) => h(Page),
})
