// @ts-check

/**
 * 用来校验本仓库的eslint配置
 */
const { defineConfig } = require('eslint-define-config')

module.exports = defineConfig({
  root: true,
  extends: ['plugin:config/base'],
  ignorePatterns: ['dist', 'tsconfig'],
  // https://eslint.org/docs/user-guide/configuring/configuration-files#how-do-overrides-work
  overrides: [
    {
      files: [
        'packages/{maya-core,maya-renderer,hydra-pages,hydra-ui}/**/*.{js,jsx,ts,tsx,vue}',
        'apps/**/*.{js,jsx,ts,tsx,vue}',
      ],
      extends: ['plugin:config/vue2'],
    },
    {
      files: [
        'packages/{vite-plugin-pages,vite-plugin-docs,eslint-plugin,scripts}/**/*.{js,ts}',
        '**/*.mjs',
        '**/vite.config.ts',
      ],
      extends: ['plugin:config/node'],
    },
  ],
});
