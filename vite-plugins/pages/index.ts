import type { Plugin } from 'vite'
import { readFileSync } from 'fs'
import mockMiddleware from './middlewares/mock'
import htmlMiddleware from './middlewares/html'
import type { ProxyConfig, MockConfig, PluginOptions } from './types'

function pagePlugin(options?: PluginOptions): Plugin {
  const IframePage = '@page'
  const name = 'vite-plugin-pages'
  const mockTable: Record<string, MockConfig> = {}
  return {
    name,
    resolveId(id) {
      if (id === IframePage) {
        return id
      }
      return null
    },
    load(id) {
      // avoid to bundle page module into vendor
      if (id === IframePage) {
        return readFileSync(require.resolve('./page'), 'utf8')
      }
      return null
    },
    config(userConfig) {
      const port = userConfig.server?.port
      if (userConfig.server?.proxy) {
        throw new Error('please use vite-plugin-pages to specify proxy config instead using server.proxy.')
      }
      const config: any = {
        server: {
          port: port || +(process.env.PORT || 8080),
        },
      }
      if (options?.userProxy || options?.defaultProxy) {
        const { userProxy = {}, defaultProxy = {} } = options
        Object.keys(userProxy).forEach((k) => {
          const mock = userProxy[k]
          if (typeof mock === 'string') { return }
          if (typeof mock === 'function' || ('code' in mock && 'data' in mock)) {
            mockTable[k] = mock
            delete userProxy[k]
          }
        })
        config.server.proxy = {
          ...userProxy,
          ...defaultProxy,
        }
      }
      return config
    },
    configureServer(server) {
      server.middlewares.use(mockMiddleware(server, mockTable))
      return () => {
        server.middlewares.use(htmlMiddleware(server))
      }
    },
  }
}

function defineProxy(config: ProxyConfig) {
  return config
}

export { pagePlugin, defineProxy }
