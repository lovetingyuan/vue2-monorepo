### pages

用来存放在不同系统中共享的页面，以达到页面复用的目的

### 开发

页面开发约定以`pages/**/index.vue`作为页面入口组件

::: warning 注意

**如果需要安装运行时的第三方依赖，请使用 `pnpm add <package> --save-peer`**

**如果使用 webpack4 来构建应用，那么引入的方式需要改为`import Page from 'pages/dist/pages/<page-path>'`**

:::
