// 'use strict'

const path = require('path')
// const docUrl = require('./utils/docUrl');

// ------------------------------------------------------------------------------
// Constants
// ------------------------------------------------------------------------------

// const DEFAULTS = {
//   allow: 'always',
//   extensions: ['.jsx'],
// }

function getAttribute(node, name) {
  return (
    node.startTag.attributes.find(
      /**
       * @param {VAttribute | VDirective} node
       * @returns {node is VAttribute}
       */
      (node2) => {
        return !node2.directive && node2.key.name === name
      }
    ) || null
  )
}

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------

module.exports = {
  meta: {
    type: 'problem',

    docs: {
      description: 'Restrict file extensions that may contain JSX',
      category: 'Possible Errors',
      recommended: true,
      // url: docUrl('jsx-filename-extension', true)
    },
    fixable: 'code',
    messages: {
      noJSXWithExtension: "JSX is not allowed in files with extension '{{ext}}'",
      extensionOnlyForJSX: "Only files containing JSX may use the extension '{{ext}}'",
      noVueLangWithJSX: 'Vue script lang attribute must be "jsx" or "tsx" when using jsx',
    },

    schema: [
      {
        type: 'object',
        properties: {
          // allow: {
          //   enum: ["always", "as-needed"],
          // },
          extensions: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    const filename = context.getFilename()

    let jsxNode

    if (filename === '<text>') {
      // No need to traverse any nodes.
      return {}
    }

    // const allow = (context.options[0] && context.options[0].allow) || DEFAULTS.allow
    // const allowedExtensions = (context.options[0] && context.options[0].extensions) || DEFAULTS.extensions
    // const isAllowedExtension = allowedExtensions.some((extension) => filename.slice(-extension.length) === extension)

    const documentFragment = context.parserServices.getDocumentFragment && context.parserServices.getDocumentFragment()
    let scriptElement
    if (documentFragment) {
      scriptElement = documentFragment.children
        .filter((v) => v.type === 'VElement')
        .find((el) => el.name === 'script')
    }

    // --------------------------------------------------------------------------
    // Public
    // --------------------------------------------------------------------------
    const allowedExtension = ['.jsx', '.tsx']
    return {
      'JSXElement, JSXFragment'(node) {
        if (!jsxNode) {
          jsxNode = node
        }
      },

      'Program:exit'(node) {
        const ext = path.extname(filename)
        if (jsxNode) {
          if (ext === '.vue' && scriptElement) {
            const lang = getAttribute(scriptElement, 'lang')
            if (!lang) {
              context.report({
                node: scriptElement.startTag,
                messageId: 'noVueLangWithJSX',
                fix(fixer) {
                  const [, b] = scriptElement.startTag.range
                  return fixer.replaceTextRange([b - 1, b], ' lang="jsx">')
                }
              })
            } else if (!lang.value) {
              context.report({
                node: lang,
                messageId: 'noVueLangWithJSX',
                fix(fixer) {
                  return fixer.replaceTextRange(lang.range, 'lang="jsx"')
                }
              })
            } else if (!allowedExtension.includes(`.${lang.value.value}`)) {
              let langValue = ''
              if (lang.value.value === 'js' || lang.value.value === 'ts') {
                langValue = `${lang.value.value}x`
              }
              const info = {
                node: lang,
                messageId: 'noVueLangWithJSX',
              }
              if (langValue) {
                info.fix = (fixer) => {
                  return fixer.replaceTextRange(lang.range, `lang="${langValue}"`)
                }
              }
              context.report(info)
            }
          } else if (!allowedExtension.includes(ext)) {
            context.report({
              node: jsxNode,
              messageId: 'noJSXWithExtension',
              data: { ext },
            })
          }
          return
        }

        if (allowedExtension.includes(ext)) {
          context.report({
            node,
            messageId: 'extensionOnlyForJSX',
            data: { ext },
          })
        }
      },
    }
  },
}
