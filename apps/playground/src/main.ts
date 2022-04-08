import Vue from 'vue';
import Page from '@page';

import MayaCore from 'core';

Vue.config.productionTip = false;
Vue.use(MayaCore);

// eslint-disable-next-line no-new
new Vue({
  el: '#app',
  render: (h) => h(Page),
});
