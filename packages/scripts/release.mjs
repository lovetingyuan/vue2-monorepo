#!/usr/bin/env node
/**
 * 更新并发布包到mnpm
 */
import path from 'path'
import color from 'picocolors'
import enquirer from 'enquirer'
import semver from 'semver'
import standardVersion from 'standard-version'
import simpleGit from 'simple-git'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const workDir = process.cwd()

const firstRelease = process.argv.includes('first-release')
const dryRun = process.argv.includes('dry-run')

/**
 *
 * @param {string} f
 * @returns
 */
const resolve = (f) => path.resolve(workDir, f)

const pkg = require(resolve('package.json'))

const repo = typeof pkg.repository === 'string' ? pkg.repository : pkg.repository.url

async function main() {
  if (pkg.private) {
    console.log(`${pkg.name} 是私有包，不能发布`)
    return
  }

  console.log(`package: ${color.yellow(pkg.name)}, version: ${color.green(pkg.version)}`)
  console.log()

  const { execa } = await import('execa')
  const { stdout: user } = await execa('npm', ['whoami']).catch(() => ({}))
  if (!user) {
    const { yes } = await enquirer.prompt({
      type: 'confirm',
      name: 'yes',
      message: '无法获取npm用户名，请确认是否已登录mnpm，继续发布可能失败，继续吗？',
    })
    if (!yes) {
      return
    }
  }

  const git = simpleGit()
  const preRelease = semver.prerelease(pkg.version)
  let type = preRelease ? preRelease[0] : 'final'
  if (!firstRelease) {
    ({ type } = await enquirer.prompt({
      type: 'select',
      name: 'type',
      initial: preRelease ? preRelease[0] : null,
      message: `请选择发布版本类型（当前版本 ${color.yellow(pkg.version)}）`,
      choices: [
        'alpha',
        'beta',
        'rc',
        {
          message: '正式版',
          name: 'final',
        },
      ],
    }))
  }
  const releaseTag = type !== 'final' ? type : ''
  let releaseVersion
  let releaseAs
  if (firstRelease) {
    releaseVersion = pkg.version
    releaseAs = ''
  } else {
    const versions = (t) => {
      const vs = t === 'final' ? ['patch', 'minor', 'major'] : ['prerelease', 'prepatch', 'preminor', 'premajor']
      return vs.map((i) => `${i}  -->  ${semver.inc(pkg.version, i, t === 'final' ? '' : t)}`)
    }
    const { release } = await enquirer.prompt({
      type: 'select',
      name: 'release',
      message: `请选择要发布的版本（当前版本 ${color.yellow(pkg.version)}）`,
      format: (v) => v.split(' ').pop(),
      choices: versions(type),
    })
    releaseVersion = release.split(' ').pop()
    releaseAs = release.split(' ').shift()
  }

  const status = await git.status()
  if (status.files) {
    const root = await git.revparse(['--show-toplevel'])
    const hasChangedFiles = status.files.filter((v) => {
      return path.resolve(root, v.path).startsWith(workDir)
    }).length > 0
    if (hasChangedFiles) {
      throw new Error('请先提交 git 变更再发布')
    }
  }

  const { current } = await git.branchLocal()
  if (current !== 'master' && !releaseTag) {
    throw new Error('正式版需要在 master 分支发布')
  }
  const { action } = await enquirer.prompt({
    type: 'select',
    name: 'action',
    message: `请选择发布类型（待发布版本：${color.blue(releaseVersion)}）`,
    choices: [
      {
        name: 1,
        message: '仅更新 version 和 tag',
      },
      {
        message: '更新并发布至 mnpm 和 git',
        name: 2,
      },
      {
        message: '终止发布',
        name: -1,
      },
    ],
    format() {
      return this.selected.message
    },
  })
  if (action === -1) {
    return
  }
  await git.pull()
  console.log(color.cyan('update version and make git tag...'))
  const standardVersionOptions = {
    dryRun,
    header: `## ${pkg.name} changelog   `,
    commitUrlFormat: `${repo}/commit/{{hash}}`,
    compareUrlFormat: `${repo}/pr/create?source=refs%2Ftags%2F{{currentTag}}&target=refs%2Ftags%2F{{previousTag}}&tab=diff`,
    firstRelease,
    noVerify: true,
    tagPrefix: `${pkg.name}@`,
    releaseCommitMessageFormat: `chore(release): ${pkg.name}@{{currentTag}}`,
    path: workDir,
    scripts: {
      // 不能用 prerelease 因为有可能引用了 package.json 里的 version
      postbump: `${pkg.scripts.test ? 'pnpm run test && ' : ''}pnpm run build`,
    },
    lernaPackage: pkg.name,
    ...pkg['standard-version'],
  }
  if (releaseAs) {
    standardVersionOptions.releaseAs = releaseAs
  }
  if (releaseTag) {
    standardVersionOptions.prerelease = releaseTag
  }
  await standardVersion(standardVersionOptions)
  if (action !== 2) {
    return
  }
  console.log(color.cyan(`push tags to origin/${current}...`))
  if (!dryRun) {
    await git.push('origin', current, ['--follow-tags'])
  }

  console.log(color.cyan(`publish ${pkg.name} to mnpm by ${user || 'N/A'}...`))
  if (!dryRun) {
    await execa('npm', ['publish', ...(releaseTag ? ['--tag', releaseTag] : [])], { stdio: 'inherit' })
  }
  await execa('npm', ['view', pkg.name], { stdio: 'inherit' })
  console.log()
  console.log(color.green('✨ 发布完成'))
}

main().catch((err) => {
  console.error(color.red('发布失败: '))
  throw err
})
