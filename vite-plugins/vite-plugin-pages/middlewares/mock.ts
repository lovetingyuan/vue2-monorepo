import { Connect, send, ViteDevServer } from 'vite'
import type { ApiRes, MockConfig } from '../types'

export default (server: ViteDevServer, mockConfig: Record<string, MockConfig>) => {
  const mockMiddleware: Connect.NextHandleFunction = async function mock(req, res, next) {
    if (!req.url) { return next() }
    const url = new URL(req.url, 'http://localhost')
    const route = Object.keys(mockConfig).find((r) => {
      return new RegExp(r).test(url.pathname)
    })
    if (!route) {
      return next()
    }
    const mockData: ApiRes = { code: 0, message: '', data: null }
    const config = mockConfig[route]
    if (typeof config === 'function') {
      Object.assign(mockData, await config(server, req))
    } else {
      Object.assign(mockData, config)
    }
    await new Promise((r) => { setTimeout(r, 600) })
    send(req, res, JSON.stringify(mockData), 'json', {})
    return null
  }
  return mockMiddleware
}
