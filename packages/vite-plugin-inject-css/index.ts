import type { Plugin } from 'vite'

// vite wont inject css when build format is es
const injectCSSPlugin = (): Plugin => {
  return {
    name: 'inject-css-for-es',
    apply: 'build',
    enforce: 'post',
    config() {
      return {
        build: {
          cssCodeSplit: true
        }
      }
    },
    // eslint-disable-next-line consistent-return
    renderChunk(code, chunk) {
      const { fileName, isEntry } = chunk;
      const { viteMetadata } = chunk as any;
      if (fileName.endsWith('.es.js') && isEntry && viteMetadata) {
        return [...viteMetadata.importedCss].map((css) => `import "./${css}";`).join('\n') + code;
      }
    }
  }
}

export default injectCSSPlugin
