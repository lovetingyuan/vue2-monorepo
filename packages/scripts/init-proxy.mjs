#!/usr/bin/env node

// @ts-check

/**
 * 为 vite-plugin-pages 初始化proxy配置文件
 */
import path from 'path'
import fs from 'fs-extra'

const proxy = path.resolve(process.cwd(), 'proxy/index.ts')

if (!fs.existsSync(proxy)) {
  fs.outputFileSync(proxy, [
    "import { defineProxy } from 'vite-plugin-pages'", '',
    'export default defineProxy({',
    '  // https api config',
    '})', ''
  ].join('\n'))
}
