/**
 * 注入css到es bundle中，vite不会自动注入
 */
import type { Plugin } from 'vite'

export default (): Plugin => {
  return {
    name: 'insert-css-into-es-bundle',
    config() {
      return {
        build: {
          cssCodeSplit: true // enable bundle css into umd js
        }
      }
    },
    generateBundle(options, bundle) {
      if (options.format === 'es') {
        const distFile = bundle[options.entryFileNames as string]
        const cssFile = bundle['index.css']
        if (distFile && cssFile && cssFile.type === 'asset' && distFile.type === 'chunk') {
          const code = [
            'var __vite_style__=document.createElement("style")',
            `__vite_style__.innerHTML=${JSON.stringify(cssFile.source)}`,
            'document.head.appendChild(__vite_style__)'
          ].join(';')
          distFile.code = `${code};${distFile.code}`
        }
      }
    }
  }
}
