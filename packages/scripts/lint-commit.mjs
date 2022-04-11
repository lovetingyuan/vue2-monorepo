#!/usr/bin/env node

// @ts-check
import path from 'path'
import { fileURLToPath } from 'url'

const dirname = fileURLToPath(import.meta.url)

async function main() {
  const { execa } = await import('execa')
  const configFile = path.resolve(dirname, '../commitlint.config.js')
  await execa('pnpm', ['exec', 'commitlint', '--edit', '.git/COMMIT_EDITMSG', '--config', configFile], {
    stdio: 'inherit'
  })
}

main().catch(() => {
  console.error('commit lint failed.')
  // eslint-disable-next-line no-process-exit
  process.exit(-1)
})
