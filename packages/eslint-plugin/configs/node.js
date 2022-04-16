// @ts-check

const { defineConfig } = require('eslint-define-config')

const tryExtensions = ['.js', '.json', '.mjs', '.cjs', '.ts', '.d.ts']

module.exports = defineConfig({
  env: {
    node: true,
    commonjs: true,
    browser: false
  },
  plugins: ['config', 'node'],
  extends: [
    'airbnb-base',
    'plugin:node/recommended',
    'plugin:config/base'
  ],
  rules: {
    'global-require': ['off'],
    'no-console': ['off'],

    'import/no-import-module-exports': ['warn'],
    'import/no-extraneous-dependencies': ['off'],
    'import/no-dynamic-require': ['off'],
    'import/extensions': [
      'error',
      'always',
      {
        js: 'never',
        mjs: 'never',
        cjs: 'never',
        ts: 'never',
      },
    ],
    'node/no-unsupported-features/es-syntax': ['off'],
    'node/no-unsupported-features/node-builtins': ['off'],
    'node/no-unpublished-import': ['warn'],
    'node/no-missing-import': ['error', {
      tryExtensions
    }],
    'node/no-missing-require': ['error', {
      tryExtensions
    }],
    'node/no-extraneous-import': ['warn', {
      allowModules: ['vue', 'vite', 'fs-extra', 'vite-plugin-vue2'],
      tryExtensions
    }],
    'node/no-extraneous-require': ['error', {
      allowModules: ['vue', 'vite', 'vite-plugin-vue2']
    }],
  },
  overrides: [{
    files: ['*.ts'],
    parser: '@typescript-eslint/parser',
    settings: {
      'import/parsers': {
        '@typescript-eslint/parser': ['.ts', '.tsx', '.d.ts'],
      },
    },
    parserOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      ecmaFeatures: {
        jsx: true,
      },
    },
    extends: [
      'plugin:import/typescript',
      'plugin:@typescript-eslint/recommended',
      'plugin:config/base'
    ],
    rules: {
      '@typescript-eslint/consistent-type-assertions': [
        'error',
        {
          assertionStyle: 'as',
          objectLiteralTypeAssertions: 'allow',
        },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          ignoreRestSiblings: true,
          args: 'after-used',
        },
      ],
      '@typescript-eslint/no-empty-interface': ['warn'],
      '@typescript-eslint/explicit-function-return-type': ['off'],
    }
  }]
})
