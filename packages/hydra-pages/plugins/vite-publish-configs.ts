import {
  loadEnv, type Plugin, type ResolvedConfig, transformWithEsbuild
} from 'vite'
import enquirer from 'enquirer'
import path from 'path'
import fs from 'fs'
import fetch from 'node-fetch'
import { fileURLToPath } from 'url'
import simpleGit from 'simple-git'
import isEqual from 'lodash.isequal';
import color from 'picocolors'
import assert from 'assert'

export const MID = '@configs'

const dryRun = process.argv.includes('dry-run')

if (dryRun) {
  console.warn(color.yellow('You are in "dry run" mode!'))
  console.log()
}

let config: ResolvedConfig

const rootDir = fileURLToPath(new URL('../', import.meta.url))

const [DEVELOPMENT, TESTING] = [1, 2];

const hornEnvInfo = loadEnv('horn', rootDir, 'HORN_')
const git = simpleGit();

if (!hornEnvInfo.HORN_TOKEN) {
  const file = path.join(rootDir, '.env.horn.local')
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, [
      '# HORN_TOKEN 可以访问 https://horn.sankuai.com/projects，点击右上角头像可以查看',
      'HORN_APP_KEY=com.sankuai.groceryclient.configuration',
      'HORN_APP_SECRET=8b234149-c5fe-4525-ad87-9026c458bf14',
      'HORN_TOKEN='
    ].join('\n'))
  }
  if (!dryRun) {
    throw new Error('请先完善 .env.horn.local 文件')
  }
}

const post = (data: any) => {
  if (dryRun) {
    return Promise.resolve({})
  }
  return fetch('https://horn.sankuai.com/api/jisper', {
    method: 'POST',
    headers: {
      'Horn-AppKey': hornEnvInfo.HORN_APP_KEY,
      'Horn-AppSecret': hornEnvInfo.HORN_APP_SECRET,
      'Horn-Token': hornEnvInfo.HORN_TOKEN,
      'Content-Type': 'application/json;charset=utf-8'
    },
    body: JSON.stringify(data)
  }).then(r => r.json())
}

const transformCode = async (configs: Record<string, any>, target: string) => {
  const jsonStr = JSON.stringify(configs)
  const transformTasks: Promise<void>[] = []
  const replaceIdMap: Record<string, string> = {}
  let transformedStr = jsonStr.replace(
    /":"\{\{(.+?)\}\}"(,|\})/g,
    (s, e, t) => {
      const replaceId = `${Math.random()}`
      const expression = e.replace(/\\"/g, '"')
      const task = transformWithEsbuild(`return ${expression}`, '', {
        sourcemap: false,
        target,
        minify: true,
        keepNames: true
      }).then(result => {
        if (replaceId in replaceIdMap) {
          throw new Error('impossible')
        }
        if (!result.code) {
          throw new Error(`transformed code is empty, ${e}`)
        }
        replaceIdMap[replaceId] = `(function(){${result.code.trim()}})()`;
      })
      transformTasks.push(task)
      return `":${replaceId}${t}`
    }
  )
  await Promise.all(transformTasks)
  Object.keys(replaceIdMap).forEach(id => {
    const expression = JSON.stringify(`{{${replaceIdMap[id]}}}`)
    transformedStr = transformedStr.replace(id, expression)
  })
  return JSON.parse(transformedStr)
}

const getConfig = async (filepath: string) => {
  const { name } = path.parse(filepath);
  const hornKey = name.split('.').shift() as string;
  const hornData = await post([
    'files.getByKey',
    hornKey,
    DEVELOPMENT
  ])
  const hornProperties = hornData.properties;
  let hornConfig = null;
  if (dryRun) {
    return {
      hornConfig: {}, hornData: {}
    }
  }

  // 处理下正确获得 config 配置
  if (hornProperties.length && !hornProperties[0].condition) {
    const [firstConfig] = hornProperties[0].properties;
    if (firstConfig.name === 'config' && firstConfig.values[0]) {
      hornConfig = firstConfig.values[0].value
    } else {
      throw new Error('horn 配置有问题')
    }
  } else {
    throw new Error('horn 配置有问题')
  }

  return {
    hornConfig, hornData
  }
}

const publishConfig = async (file: string, hornData: any, localConfig: any, msg?: string) => {
  if (!dryRun) {
    // eslint-disable-next-line no-param-reassign
    hornData.properties[0].properties[0].values[0].value = localConfig
  }

  const saveResult = await post(['files.save', hornData])
  let commitId = ''
  if (saveResult && saveResult.changed && saveResult.snapshot?.commitId) {
    ({ commitId } = saveResult.snapshot)
  }
  if (!commitId && !dryRun) {
    console.error(`‼️提交 ${file} 失败:`, saveResult.error.msg)
    throw new Error(saveResult.error.msg)
  }
  const [userName, email] = (await git.getConfig('user.email')).value?.split('@') || []
  if (!userName || email !== 'meituan.com') {
    if (!dryRun) {
      throw new Error('获取用户信息失败，请检查 git 配置项：user.email')
    }
  }
  const gitCommitId = (await git.revparse(['--short', 'HEAD'])).trim()

  const { message } = await enquirer.prompt<{ message: string }>({
    type: 'input',
    name: 'message',
    message: '请输入更新说明：',
    initial: msg,
    required: true
  });
  const data = [
    'files.publish',
    commitId, TESTING,
    `${userName} 更新配置(git:${gitCommitId})`,
    message
  ];
  const publishResult = await post(data)
  if (dryRun) {
    return message
  }

  if (publishResult && publishResult.changed) {
    return message
  }
  if (!dryRun) {
    console.error(`‼️发布 ${file} 失败:`, publishResult.error.msg)
    throw new Error(publishResult.error.msg)
  }
}

export default (options?: {
  transformTarget?: string
}): Plugin | null => {
  if (!process.argv.includes('config')) {
    return null
  }
  const distName = 'configs.js'
  return {
    name: 'publish-configs-plugin',
    apply: 'build',
    async config() {
      const status = await git.status()
      if (status.files) {
        const root = await git.revparse(['--show-toplevel'])
        const hasChangedFiles = status.files.filter(v => {
          return path.resolve(root, v.path).startsWith(rootDir)
        }).length > 0
        if (hasChangedFiles) {
          if (!dryRun) {
            throw new Error('请先提交 git 变更再发布')
          }
          console.log('有git未提交', hasChangedFiles)
        }
      }
      const entry = path.resolve(rootDir, 'src/configs.ts')
      return {
        mode: 'configs',
        publicDir: false,
        build: {
          outDir: 'dist/configs',
          lib: {
            entry,
            formats: ['es'],
            fileName: () => distName,
          },
        },
      }
    },
    configResolved(c) {
      config = c
    },
    resolveId(id) {
      if (id === MID) {
        return id
      }
    },
    async load(id) {
      if (id === MID) {
        const { globby } = await import('globby')
        const pagesDir = path.resolve(config.root, 'src/pages')
        const configs = (await globby('**/*.config.{ts,json}', {
          cwd: pagesDir
        })).sort((a, b) => {
          const aa = fs.lstatSync(path.resolve(pagesDir, a))
          const bb = fs.lstatSync(path.resolve(pagesDir, b))
          // 新修改的文件排前面
          return bb.mtime.getTime() - aa.mtime.getTime()
        })
        console.log()
        const { selectedConfigs } = await enquirer.prompt<{
          selectedConfigs: string[]
        }>({
          type: 'multiselect',
          name: 'selectedConfigs',
          message: '请选择要发布的配置文件(按空格多选)：',
          choices: configs,
        })
        if (!selectedConfigs.length) {
          // eslint-disable-next-line no-process-exit
          process.exit(0)
        }
        return [
          ...selectedConfigs.map((c, i) => `import config${i} from "@/pages/${c}"`),
          `export default {${selectedConfigs.map((c, i) => `"${c}": config${i}`)}}`
        ].join('\n')
      }
    },
    async generateBundle(_, bundle) {
      const configsChunk = bundle[distName]
      assert(configsChunk.type === 'chunk')
      // eslint-disable-next-line no-param-reassign
      delete bundle[distName]
      const code = Buffer.from(configsChunk.code).toString('base64') // 更好的兼容性
      let { default: configs } = await import(`data:text/javascript;base64,${code}`)
      if (options?.transformTarget) {
        configs = transformCode(configs, options.transformTarget)
      }

      const configFiles = Object.keys(configs)
      if (dryRun) {
        console.log('configs', configs)
      }
      const { yes } = await enquirer.prompt<{ yes: boolean }>({
        type: 'confirm',
        name: 'yes',
        message: `确认发布以下配置到 test 环境？\n${configFiles.map(v => ` ${color.green(v)}`).join('\n')}\n`
      });

      if (!yes) {
        return
      }
      let message: string | undefined
      for (let i = 0; i < configFiles.length; i++) {
        const file = configFiles[i]
        // eslint-disable-next-line no-await-in-loop
        const { hornConfig, hornData } = await getConfig(file)
        if (isEqual(hornConfig, configs[file])) {
          console.log(`${color.green(file)} 未更改，跳过发布`)
          return
        }
        console.log(`${color.yellow(`${i + 1}/${configFiles.length}`)} 正在发布 ${color.green(file)} 到 horn test 环境...`)
        // eslint-disable-next-line no-await-in-loop
        message = await publishConfig(file, hornData, configs[file], message);
        console.log(`${color.green(file)} ${color.blue('发布完成')}`)
      }
    },
  }
}
