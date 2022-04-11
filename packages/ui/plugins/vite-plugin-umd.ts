/**
 * 把components下的组件打包成umd格式
 */
import { build, type Plugin, type UserConfig } from 'vite'
import { basename, resolve } from 'path'
import { existsSync } from 'fs'

let entryIndex = 0

export default (options: {
  config: () => UserConfig
  entries: string[]
}): Plugin => {
  const entries: {
    name: string, entry: string
  }[] = []
  options.entries.forEach(f => {
    const entry = resolve(f, 'index.ts')
    if (existsSync(entry)) {
      const dir = basename(f)
        .replace(/-[a-zA-Z]/g, s => s.toUpperCase().slice(1))
        .replace(/^[a-z]/, s => s.toUpperCase())
      try {
        // eslint-disable-next-line no-new-func
        new Function(`const ${dir} = 0;`)()
      } catch (err) {
        throw new Error(`Invalid name ${basename(f)}`)
      }
      entries.push({
        name: dir,
        entry
      })
    }
  })
  return {
    name: 'bundle-components-to-umd',
    apply: 'build',
    closeBundle() {
      if (entryIndex >= entries.length) {
        return
      }
      const userConfig = options.config()
      userConfig.build = userConfig.build || {}
      userConfig.build.outDir = 'dist/umd'
      userConfig.build.emptyOutDir = !entryIndex
      // eslint-disable-next-line no-plusplus
      const { entry, name } = entries[entryIndex++]
      userConfig.build.lib = {
        name,
        entry,
        formats: ['umd'],
        fileName: () => `${name}.js`
      }
      build({
        ...userConfig,
        configFile: false
      }).catch(err => {
        console.error(`Failed to bundle umd version of ${name}.`, err)
        // eslint-disable-next-line no-process-exit
        process.exit(-1)
      })
    }
  }
}
