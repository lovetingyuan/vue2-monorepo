// @ts-check

/**
 * base配置的优先级最高，配置off规则请谨慎
 */
const { defineConfig } = require('eslint-define-config')

const extensions = ['.js', '.ts', '.jsx', '.tsx', '.d.ts', '.json']

module.exports = defineConfig({
  settings: {
    'import/core-modules': ['vite', 'vite-plugin-vue2', '@configs', '@page'],
    'import/resolver': {
      node: {
        extensions
      },
      [require.resolve('../resolver')]: { // 支持 @ alias
        extensions
      },
    },
    'import/extensions': extensions
  },
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module'
  },
  plugins: ['import', 'config'],
  rules: {
    'config/require-jsx-ext': ['error'],
    'config/valid-jsx-h-inject': ['error'],

    semi: ['off'],
    'comma-dangle': ['off'],
    'arrow-body-style': ['off'],
    'arrow-parens': ['off'],
    'import/prefer-default-export': ['off'],

    'no-useless-backreference': ['error'],
    'no-setter-return': ['error'],
    'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never',
        mjs: 'never',
        jsx: 'never',
        ts: 'never',
        tsx: 'never',
      },
    ],
    curly: ['error', 'all'],
    'max-len': [
      'warn',
      120,
      2,
      {
        ignoreUrls: true,
        ignoreComments: true,
        ignoreRegExpLiterals: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true
      }
    ],
    'object-shorthand': [
      'error',
      'always',
      {
        ignoreConstructors: false,
        avoidQuotes: false
      }
    ],

    'prefer-destructuring': ['error', {
      VariableDeclarator: {
        array: true,
        object: true
      },
      AssignmentExpression: {
        array: false,
        object: false
      }
    }]
  },
})
