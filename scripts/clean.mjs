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
  '**/build',
  '!**/node_modules/**/dist',
  '!**/node_modules/**/build',
  '**/{.cache,.vite,.turbo}'
], {
  dot: true,
  cwd: root,
  onlyDirectories: true,
  absolute: true
})

if (dryRun) {
  console.log('delete list: ', dirs)
} else {
  dirs.forEach((d) => {
    rmSync(d, {
      recursive: true,
      force: true
    })
  })
  console.log('cleaned!')
}
