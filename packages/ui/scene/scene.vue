<template>
  <section class="component-example">
    <details>
      <summary>
        {{ titleStr }}
      </summary>
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
      id: `copy${Math.random().toString().slice(-5)}`,
      titleStr: this.title
    }
  },
  watch: {
    sourceCode() {
      if (this.$refs.code) {
        this.$refs.code.textContent = this.sourceCode
      }
      if (this.$el) {
        window.Prism.highlightAllUnder(this.$el)
      }
    }
  },
  mounted() {
    window.addEventListener('__code_update__', (this.getSourceCode(), this.getSourceCode))
    this.resizeObserver = new ResizeObserver(() => {
      setTimeout(() => {
        const { height } = window.getComputedStyle(document.documentElement)
        if (this.targetIframe) {
          this.targetIframe.style.height = `${parseInt(height, 10) + 2}px`
        }
      })
    })
    this.resizeObserver.observe(document.documentElement)
    this.clipboard = new window.ClipboardJS(this.$refs.copyBtn)
    this.clipboard.on('success', e => e.clearSelection())
    window.addEventListener('hashchange', this.updateTitle)
    this.targetIframe = [...window.parent.document.querySelectorAll('iframe')].find(iframe => iframe.contentWindow === window)
  },
  beforeDestroy() {
    window.removeEventListener('__code_update__', this.getSourceCode)
    this.resizeObserver.unobserve(document.documentElement)
    this.clipboard.destroy()
    window.removeEventListener('hashchange', this.updateTitle)
  },
  methods: {
    code() {
      const { file } = this.$slots.default[0].componentInstance.$options
      if (file) {
        fetch(`/__open-in-editor?file=${encodeURIComponent(file)}`)
      }
    },
    getSourceCode(evt) {
      const { file, code } = this.$slots.default[0].componentInstance.$options
      if (import.meta.env.DEV) {
        if (evt?.detail?.file && evt.detail.file !== file) {
          return
        }
        import(/* @vite-ignore */`${file.replace(/^.+?\/components\//, '../components/')}?raw&_t=${Date.now()}`).then(r => {
          this.sourceCode = r.default
        })
      } else {
        this.sourceCode = code
      }
    },
    updateTitle() {
      this.titleStr = decodeURIComponent(window.location.hash).slice(1)
    }
  },
}
</script>

<style scoped>
.component-example {
  position: relative;
}

.component-example pre {
  padding: 20px 24px;
  border-radius: 5px;
  background-color: #282c34;
}
.component-example code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}
.component-example summary {
  cursor: pointer;
  background-color: #cdcdcd33;
  padding: 8px 15px;
  border-radius: 4px;
  transition: all 0.3s;
}
.component-example summary::marker {
  color: var(--c-brand);
  margin-right: 1em;
}
.component-example summary::after{
  content: '</code>';
  float: right;
  font-size: 12px;
  line-height: 22px;
}
.component-example summary:hover {
  background-color: #b3b3b366;
}

.component-container {
  box-shadow: 0 0 4px 0px #dfdfdf;
  margin: 20px 2px 0 2px;
  border-radius: 5px;
  padding: 20px 10px;
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
