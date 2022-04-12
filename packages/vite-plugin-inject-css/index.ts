import type { Plugin } from 'vite'
import { extname } from 'path'

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
    renderChunk(code, chunk, opt) {
      const { fileName, isEntry, isDynamicEntry } = chunk
      const { viteMetadata } = chunk as any
      if (['.js', '.mjs', '.cjs'].includes(extname(fileName)) && opt.format === 'es' && (isEntry || isDynamicEntry) && viteMetadata) {
        return [...viteMetadata.importedCss].map((css) => `import "./${css}";`).join('\n') + code
      }
    }
  }
}

export default injectCSSPlugin
