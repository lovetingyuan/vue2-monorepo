import type { Connect, ViteDevServer, ResolvedConfig } from 'vite';

export interface ApiRes { code: number, message: string, data: any }
export type MockConfig = ApiRes | ((server: ViteDevServer, req: Connect.IncomingMessage) => ApiRes | Promise<ApiRes>)

export interface ProxyConfig {
  [k: string]: string | MockConfig
}
export interface PluginOptions {
  userProxy?: ProxyConfig,
  defaultProxy?: ResolvedConfig['server']['proxy']
}
