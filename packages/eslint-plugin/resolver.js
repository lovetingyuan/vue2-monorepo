const path = require('path')
const fs = require('fs')
const vite = require('vite')
// eslint-disable-next-line node/no-extraneous-require
const nodeResolver = require('eslint-import-resolver-node')

const nodeResolve = nodeResolver.resolve

const isWorkDir = (dir) => {
  const pkg = path.resolve(dir, 'package.json')
  try {
    fs.accessSync(pkg, fs.constants.R_OK)
    return true
  } catch {
    return false
  }
}

const root = vite.searchForWorkspaceRoot(__dirname)

function resolve(source, file, config = {}) {
  if (source.startsWith('@/')) {
    // alias must resolved as absolute path
    let projectRoot = file
    while (!isWorkDir(projectRoot)) {
      projectRoot = path.dirname(projectRoot)
      if (projectRoot.length < 3) {
        break
      }
    }
    const newSource = path.resolve(projectRoot, source.replace('@/', './src/'))
    return nodeResolve.call(this, newSource, file, config)
  }
  if (source.startsWith('pages/')) {
    const [, , ...page] = source.split('/')
    const targetFile = path.resolve(root, 'packages/pages/src/pages', ...page, 'index.vue')
    if (fs.existsSync(targetFile)) {
      return {
        found: true,
        path: targetFile,
      }
    }
  }
  return {
    found: false,
  }
}

module.exports = {
  ...nodeResolver,
  resolve,
}
