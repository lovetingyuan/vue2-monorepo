import { defineConfig } from 'vitepress';
import { searchForWorkspaceRoot } from 'vite';
import { exampleContainer, initMDPlugin } from 'vite-plugin-docs';

import container from 'markdown-it-container';
import path from 'path';
import pkg from '../package.json';

const rootDir = searchForWorkspaceRoot(__dirname);

const getGuideSidebar = () => [
  {
    text: '项目介绍',
    link: '/',
  },
  {
    text: 'maya-core',
    link: '/maya-core/readme',
    children: [{ text: 'changelog', link: '/maya-core/changelog' }],
  },
  {
    text: 'maya-renderer',
    link: '/maya-renderer/readme',
    children: [{ text: 'changelog', link: '/maya-renderer/changelog' }],
  },
  {
    text: 'components',
    link: '/components/readme',
    children: [
      { text: 'changelog', link: '/components/changelog' },
      {
        text: 'demo',
        children: [
          {
            text: 'demo',
            link: '/components/demo/demo',
          },
        ],
      },
      {
        text: 'search-table',
        link: '/components/search-table/SearchProTable',
      },
    ],
  },
  {
    text: 'pages',
    link: '/pages/readme',
    children: [{ text: 'changelog', link: '/pages/changelog' }],
  },
];

export default defineConfig({
  title: '配置化文档',
  description: 'maya文档站',
  // srcDir: rootDir,
  head: [['link', { rel: 'shortcut icon', href: '/icon.png' }]],
  vite: {
    resolve: {
      alias: {
        '@root': rootDir,
        '@packages': path.resolve(rootDir, 'packages'),
      },
    },
    plugins: [
      initMDPlugin()
    ],
  },
  markdown: {
    config(md) {
      exampleContainer(md, container);
    },
  },
  themeConfig: {
    logo: '/icon.png',
    nav: [
      { text: '文档', link: '/', activeMatch: '^/' },
      {
        text: '仓库',
        link: pkg.repository.url,
      },
    ],
    lastUpdated: '✍️',
    sidebar: getGuideSidebar(),
  },
});
