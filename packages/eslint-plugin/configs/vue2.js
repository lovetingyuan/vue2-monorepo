// @ts-check

const { defineConfig } = require('eslint-define-config');

module.exports = defineConfig({
  env: {
    node: false,
    commonjs: false,
    browser: true,
    'vue/setup-compiler-macros': true
  },
  settings: {
    'import/core-modules': ['@page'],
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx', '.d.ts'],
    },
  },
  plugins: ['config'],
  extends: ['airbnb-base'],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  rules: {
    'import/no-commonjs': ['error'],
    'import/no-amd': ['error'],
    'import/no-nodejs-modules': ['error'],
    'import/no-extraneous-dependencies': ['warn'],
    'no-process-env': ['error'],
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
    '@typescript-eslint/explicit-function-return-type': ['off'],
    '@typescript-eslint/no-empty-interface': ['warn'],
  },
  overrides: [
    {
      files: ['*.vue'],
      env: {
        node: false,
        commonjs: false,
      },
      parserOptions: {
        ecmaVersion: 2021,
        sourceType: 'module',
        ecmaFeatures: {
          // https://github.com/typescript-eslint/typescript-eslint/tree/master/packages/parser#parseroptionsecmafeaturesjsx
          jsx: true,
        },
        // @ts-ignore
        parser: {
          ts: '@typescript-eslint/parser',
          tsx: '@typescript-eslint/parser',
          '<template>': 'espree',
        },
        extraFileExtensions: ['.vue'],
      },
      plugins: ['vue-scoped-css'],
      extends: [
        '@vue/airbnb',
        'plugin:vue-scoped-css/recommended',
        'plugin:import/typescript',
        'plugin:vue/recommended',
        '@vue/typescript/recommended',
        'plugin:config/base'
      ],
      rules: {
        'vuejs-accessibility/click-events-have-key-events': ['off'],
        'vue/multi-word-component-names': ['off'],
        'vue/no-deprecated-scope-attribute': ['error'],
        'vue/no-deprecated-inline-template': ['error'],
        'vue-scoped-css/no-parsing-error': ['error'],
        'vue-scoped-css/no-deprecated-deep-combinator': ['error'],
        'vue/max-attributes-per-line': [
          'error',
          {
            singleline: {
              max: 3,
            },
            multiline: {
              max: 1,
            },
          },
        ],
      }
    },
    {
      files: ['*.ts', '*.tsx'],
      parser: '@typescript-eslint/parser',
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
    }
  ]
});
