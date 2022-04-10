import {
  ref,
  nextTick, defineComponent, h, watchEffect
} from 'vue';

export default defineComponent({
  name: 'Doc',
  props: {
    title: {
      type: String,
    },
    src: {
      type: String,
    },
  },
  setup(props) {
    const iframeSrc = ref('');
    const hidden = ref(false);
    if (!props.src) {
      if (import.meta.env.DEV) {
        iframeSrc.value = `${import.meta.env.BASE_URL}scene.html?comp=${encodeURIComponent(
          `.${window.location.pathname.replace('.html', '.vue')}`
        )}`;
      }
      hidden.value = true;
    } else if (typeof window === 'object') {
      const params = new URLSearchParams();
      params.append('src', props.src);
      params.append('title', props.title || '代码');

      nextTick(() => {
        // ? SSR水合后并没有更新iframeSrc 不知道为什么
        iframeSrc.value = `${
          import.meta.env.BASE_URL + (import.meta.env.DEV ? 'scene.html' : 'scene/index.html')
        }?${params.toString()}`;
      });
    }
    const iframe = ref<HTMLIFrameElement | null>(null);
    watchEffect(() => {
      if (iframe.value?.contentWindow) {
        iframe.value.contentWindow.location.hash = props.title || '';
      }
    });
    return () => {
      return !props.src && import.meta.env.PROD
        ? h('template')
        : h('iframe', {
          src: iframeSrc.value,
          frameborder: '0',
          title: props.title,
          ref: iframe,
          style: {
            display: hidden.value ? 'none' : 'block',
            width: '100%',
            marginBottom: '20px',
          },
        });
    };
  },
});
