### pages

用来存放在不同系统中共享的配置化页面，以达到页面复用的目的

### 开发

页面开发类似于芥末系统，约定以`pages/**/index.vue`作为页面入口组件

配置文件约定名字为`<horn_key>.config.ts`，默认导出配置对象

### 发布配置

运行 `pnpm run pub-configs`

::: warning 注意

**如果需要安装运行时的第三方依赖，请使用 `pnpm add <package> --save-peer`**

**如果使用 webpack4 来构建应用，那么引入的方式需要改为`import Page from 'pages/dist/pages/<page-path>'`**

:::
