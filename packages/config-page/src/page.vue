<template>
  <div class="page" data-page>
    <slot v-if="error" name="page-fallback">
      <h4 style="text-indent: 2em">
        页面发生错误，请
        <a href="javascript:location.reload()" style="color: cornflowerblue">刷新重试</a>。
      </h4>
    </slot>
    <div v-else-if="!renderer">
      <slot name="page-loading">
        <div class="el-loading-mask is-fullscreen">
          <div class="el-loading-spinner">
            <svg viewBox="25 25 50 50" class="circular">
              <circle
                cx="50"
                cy="50"
                r="20"
                fill="none"
                class="path"
              />
            </svg>
            <p class="el-loading-text">
              正在加载...
            </p>
          </div>
        </div>
      </slot>
    </div>
    <component
      :is="renderer"
      v-else
      :config="uiConfig"
      @error="error = true"
    >
      <template v-for="name of slots" :slot="name" slot-scope="scope">
        <slot :name="name" v-bind="scope" />
      </template>
    </component>
  </div>
</template>

<script>
import { loadRenderer } from './utils';

export default {
  name: 'ConfigPage',
  props: {
    config: {
      required: true,
      type: Object,
    },
  },
  data() {
    return {
      renderer: null,
      error: false,
      uiConfig: '',
    };
  },
  computed: {
    slots() {
      return Object.keys({
        ...this.$slots,
        ...this.$scopedSlots,
      }).filter((s) => !s.startsWith('page-'));
    },
  },
  created() {
    const { version } = this.config
    this.uiConfig = JSON.stringify(this.config);
    loadRenderer(version)
      .then((res) => {
        this.renderer = res.Renderer;
        this.$nextTick(() => this.$emit('rendered'));
      })
      .catch((err) => {
        this.error = true;
        if (import.meta.env.DEV) {
          console.error('[core] error: ', err);
        }
      });
  },
};
</script>

<style>
.el-loading-parent--relative {
  position: relative !important;
}
.el-loading-parent--hidden {
  overflow: hidden !important;
}
.el-loading-mask {
  display: block;
  position: absolute;
  z-index: 2000;
  background-color: rgba(255, 255, 255, 0.9);
  margin: 0;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  -webkit-transition: opacity 0.3s;
  transition: opacity 0.3s;
}
.el-loading-mask.is-fullscreen {
  position: fixed;
}
.el-loading-mask.is-fullscreen .el-loading-spinner {
  margin-top: -100px;
}
.el-loading-mask.is-fullscreen .el-loading-spinner .circular {
  height: 50px;
  width: 50px;
}
.el-loading-spinner {
  top: 50%;
  width: 100%;
  text-align: center;
  position: absolute;
}
.el-loading-spinner .el-loading-text {
  color: #409eff;
  margin: 20px 0;
  font-size: 16px;
  font-weight: bold;
  letter-spacing: 2px;
  user-select: none;
}
.el-loading-spinner .circular {
  height: 42px;
  width: 42px;
  -webkit-animation: loading-rotate 2s linear infinite;
  animation: loading-rotate 2s linear infinite;
}
.el-loading-spinner .path {
  -webkit-animation: loading-dash 1.5s ease-in-out infinite;
  animation: loading-dash 1.5s ease-in-out infinite;
  stroke-dasharray: 90, 150;
  stroke-dashoffset: 0;
  stroke-width: 2;
  stroke: #409eff;
  stroke-linecap: round;
}
.el-loading-spinner i {
  color: #409eff;
}
.el-loading-fade-enter,
.el-loading-fade-leave-active {
  opacity: 0;
}
@-webkit-keyframes loading-rotate {
  100% {
    -webkit-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}
@keyframes loading-rotate {
  100% {
    -webkit-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}
@-webkit-keyframes loading-dash {
  0% {
    stroke-dasharray: 1, 200;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -40px;
  }
  100% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -120px;
  }
}
@keyframes loading-dash {
  0% {
    stroke-dasharray: 1, 200;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -40px;
  }
  100% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -120px;
  }
}
</style>
