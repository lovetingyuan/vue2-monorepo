import { existsSync } from 'fs';
import { resolve } from 'path';
import type { Connect, ViteDevServer } from 'vite';

export default (server: ViteDevServer) => {
  const serveIndexHtml: Connect.NextHandleFunction = (req, res, next) => {
    if (req.method === 'GET' && req.headers.accept?.includes('text/html') && req.url) {
      const { pathname } = new URL(req.url.replace(server.config.base, '/'), 'http://localhost')
      if (pathname.endsWith('.html')) {
        const page = resolve(server.config.root, `src/pages${pathname.replace('.html', '/index.vue')}`)
        if (existsSync(page)) {
          // eslint-disable-next-line no-param-reassign
          req.url = `${server.config.base}index.html`
        }
      }
    }
    next();
  }
  return serveIndexHtml
}
