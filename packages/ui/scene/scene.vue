<template>
  <section class="component-example">
    <details>
      <summary> {{ title }} </summary>
      <div class="language-html">
        <span ref="copyBtn" class="copy-button" :data-clipboard-target="'#' + id">复制</span>
        <span v-if="dev" class="code-button" @click="code">打开</span>
        <pre><code :id="id" ref="code" /></pre>
      </div>
    </details>
    <div class="component-container">
      <slot />
    </div>
  </section>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      default: '代码'
    },
  },
  data() {
    return {
      sourceCode: '',
      dev: import.meta.env.DEV,
      id: `copy${Math.random().toString().slice(-5)}`
    }
  },
  watch: {
    sourceCode() {
      if (this.$refs.code) {
        this.$refs.code.textContent = this.sourceCode;
      }
      if (this.$el) {
        window.Prism.highlightAllUnder(this.$el)
      }
    }
  },

  mounted() {
    this.handleUpdateCode = e => {
      this.getSourceCode(e.detail.file)
    }
    window.addEventListener('__code_update__', this.handleUpdateCode)
    this.getSourceCode()
    this.resizeObserver = new ResizeObserver(() => {
      setTimeout(() => {
        const { height } = window.getComputedStyle(document.documentElement)
        window.parent.postMessage({
          height: parseInt(height, 10) + 2,
          href: window.location.href
        }, '*')
      })
    })
    this.resizeObserver.observe(document.documentElement)
    this.clipboard = new window.ClipboardJS(this.$refs.copyBtn);
    this.clipboard.on('success', (e) => {
      e.clearSelection();
    });
  },
  beforeDestroy() {
    window.removeEventListener('__code_update__', this.handleUpdateCode)
    this.resizeObserver.unobserve(document.documentElement)
    this.clipboard.destroy();
  },
  methods: {
    code() {
      const { file } = this.$slots.default[0].componentInstance.$options
      if (file) {
        fetch(`/__open-in-editor?file=${encodeURIComponent(file)}`)
      }
    },
    getSourceCode(file) {
      if (import.meta.env.DEV) {
        const { file: file2 } = this.$slots.default[0].componentInstance.$options
        if (file && file !== file2) {
          return
        }
        import(/* @vite-ignore */`${file2.replace(/^.+?\/components\//, '../components/')}?raw&_t=${Date.now()}`).then(r => {
          this.sourceCode = r.default;
        })
      } else {
        const { code } = this.$slots.default[0].componentInstance.$options
        this.sourceCode = code
      }
    },
  },
}
</script>

<style scoped>
.component-example {
  position: relative;
  padding: 0 5px;
}

.component-example pre {
  padding: 20px 24px;
  border-radius: 5px;
  background-color: #282c34;
}
.component-example code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace
}
.component-example summary {
  cursor: pointer;
  background-color: #ffd10033;
  padding: 8px 15px;
  border-radius: 4px;
  transition: all 0.3s;
}
.component-example summary::marker {
  color: var(--c-brand);
  margin-right: 1em;
}
.component-example summary::after{
  content: '代码';
  float: right;
  font-size: 12px;
  line-height: 24px;
}
.component-example summary:hover {
  background-color: #ffd10066;
}

.component-container {
  margin-top: 20px;
  box-shadow: 0 0 4px 0px #dfdfdf;
  border-radius: 5px;
  padding: 20px 10px;
}
.component-container iframe {
  display: block;
  width: 100%;
  height: 100%;
}
.copy-button,
.code-button {
  position: absolute;
  right: 14px;
  top: 55px;
  cursor: pointer;
  z-index: 9;
  font-size: 12px;
  color: #888;
  user-select: none;
}
.copy-button:hover,
.code-button:hover {
  color: #bbb;
}
.code-button {
  top: 80px;
}
</style>
