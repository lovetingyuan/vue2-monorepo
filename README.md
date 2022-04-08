# Maya <small><sup> <em>powered by Hydra</em> </sup></small>

<br>

通过 json 配置的方式开发页面，达到复用和提效的目的

### Packages

本项目采用 Monorepo 方式来组织和开发(使用 [`turborepo`](https://turborepo.org/) 和 [`pnpm`](https://pnpm.io/))，相关包如下：

- **hydra-ui**
  仓储作业组前端`业务组件库`

- **hydra-pages**
  仓库作业前端`共用页面`

- **maya-core**
  配置化渲染容器，接收配置渲染页面

- **maya-renderer**
  配置化渲染引擎

- **playground**
  本地开发页面的 demo

- **docs**
  本项目相关的文档站

- **eslint-plugin**
  统一 eslint 配置和规则

- **scripts**
  提供一些脚本命令

### 安装

1. 安装 **`nodejs >= 16`** 以及 `pnpm`
2. 安装 `volar` vscode 插件
3. 运行 `pnpm install`

### 本地开发

运行 `pnpm run dev`

::: warning 注意
如果有疑似缓存的问题，可以尝试先运行 `pnpm run clean`

由于暂不支持类型文件自动更新，如有类型改动需要重新运行 `pnpm run types`
:::

### Lint

- 按项目校验 `pnpm run lint`
- 全量校验 `pnpm run lint:all`，忽略 warning `pnpm run lint:all -- --quiet`
- 校验并修复 `pnpm run lint:fix`

### 发版

运行 `pnpm run release <package-name>`

::: warning 注意

- 修改公共组件，工具，库等必须发起 PR 并通过 CodeReview
- 正式版只能在 `master` 发布
- 涉及多个包的改动时，注意包之间的依赖顺序，先发最底层的包
- 发版有问题可以尝试降低`npm`版本到`7.10.0`

:::
