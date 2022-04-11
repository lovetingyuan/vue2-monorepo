import { defineConfig } from 'vitepress'
import { searchForWorkspaceRoot } from 'vite'
import { exampleContainer, initMDPlugin } from 'vite-plugin-docs'
import container from 'markdown-it-container'
import path from 'path'
import fs from 'fs-extra'

const rootDir = searchForWorkspaceRoot(__dirname)

const getGuideSidebar = () => [
  {
    text: '项目介绍',
    link: '/',
  },
  {
    text: 'config-page',
    link: '/config-page/readme',
    children: [{ text: 'changelog', link: '/config-page/changelog' }],
  },
  {
    text: 'renderer',
    link: '/renderer/readme',
    children: [{ text: 'changelog', link: '/renderer/changelog' }],
  },
  {
    text: 'components',
    link: '/components/readme',
    children: [
      { text: 'changelog', link: '/components/changelog' },
      {
        text: 'demo',
        link: '/components/demo/demo',
      },
    ],
  },
  {
    text: 'pages',
    link: '/pages/readme',
    children: [{ text: 'changelog', link: '/pages/changelog' }],
  },
]

export default defineConfig({
  title: '文档',
  description: '文档站',
  head: [['link', { rel: 'shortcut icon', href: '/icon.png' }]],
  vite: {
    resolve: {
      alias: {
        '@root': rootDir,
        '@packages': path.resolve(rootDir, 'packages'),
      },
    },
    plugins: [
      initMDPlugin(),
      {
        name: 'copy-scene-dist',
        apply: 'build',
        enforce: 'post',
        closeBundle() {
          const distDir = path.resolve(__dirname, './dist/scene')
          const srcDir = path.resolve(rootDir, 'packages/ui/build')
          fs.copySync(srcDir, distDir)
        }
      }
    ],
  },
  markdown: {
    config(md) {
      exampleContainer(md, container)
    },
  },
  themeConfig: {
    logo: '/icon.png',
    nav: [
      { text: '文档', link: '/', activeMatch: '^/' },
      {
        text: '仓库',
        link: 'https://github.com/lovetingyuan/vue2-monorepo',
        target: '_blank',
      },
    ],
    lastUpdated: '✍️',
    sidebar: getGuideSidebar(),
  },
})
