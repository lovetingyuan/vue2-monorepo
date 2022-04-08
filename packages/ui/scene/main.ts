import Vue from 'vue';
import Scene from './scene.vue';

const docComponents = import.meta.glob('../components/*/doc/*.vue');
const url = new URLSearchParams(window.location.search);
const src = url.get('src');
const comp = url.get('comp');

if (import.meta.env.DEV) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  import(/* @vite-ignore */ `.${comp}`);
}
if (src) {
  const lh = 'http://localhost/';
  const docSrc = new URL(`${comp}/../${src}`, lh).toString().replace(lh, './');
  docComponents[`.${docSrc}`]().then(({ default: DocComp }) => {
    // eslint-disable-next-line no-new
    new Vue({
      el: '#app',
      render(h) {
        return h(
          Scene,
          {
            props: { title: url.get('title') },
          },
          [h(DocComp)]
        );
      },
    });
  });
}
