// @ts-check

/**
 * 用来校验本仓库的eslint配置
 */
const { defineConfig } = require('eslint-define-config')

module.exports = defineConfig({
  root: true,
  extends: ['plugin:config/base'],
  ignorePatterns: ['dist', 'build'],
  // https://eslint.org/docs/user-guide/configuring/configuration-files#how-do-overrides-work
  overrides: [
    {
      files: [
        'packages/{config-page,renderer,pages,ui}/**/*.{js,jsx,ts,tsx,vue}',
        'apps/**/*.{js,jsx,ts,tsx,vue}',
      ],
      extends: ['plugin:config/vue2'],
    },
    {
      files: [
        'vite-plugins/**/*.{js,ts}',
        'packages/eslint-plugin/**/*.{js,ts}',
        'scripts/**/*.{js,ts,mjs}',
        'ts-config/*.ts',
        '**/vite.config.ts',
      ],
      extends: ['plugin:config/node'],
    },
  ],
})
