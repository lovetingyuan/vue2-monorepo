#!/usr/bin/env node

// @ts-check

import { searchForWorkspaceRoot } from 'vite'
import glob from 'fast-glob'
import { fileURLToPath } from 'url'
import { rmSync } from 'fs'

const root = searchForWorkspaceRoot(fileURLToPath(import.meta.url))

const dryRun = process.argv.includes('dry-run')

const dirs = glob.sync([
  '**/dist',
  '!**/node_modules/**/dist',
  '**/{.cache,.vite,.turbo}'
], {
  dot: true,
  cwd: root,
  onlyDirectories: true,
  absolute: true
})

if (dryRun) {
  console.log('delete list: ', dirs)
  // eslint-disable-next-line no-process-exit
  process.exit(0)
}

dirs.forEach(d => {
  rmSync(d, {
    recursive: true,
    force: true
  })
})

console.log('cleaned!');
