/**
 * @fileoverview Prevent wrong position of jsx expression
 * @author Glen Mailer
 */
// 'use strict';
// const docUrl = require('./utils/docUrl');

// -----------------------------------------------------------------------------
// Rule Definition
// -----------------------------------------------------------------------------

module.exports = {
  meta: {
    type: 'problem',

    docs: {
      description: 'Validate jsx position for auto h injection',
      category: 'Possible Errors',
      recommended: true,
      // url: docUrl('valid-jsx-h-inject', true)
    },

    messages: {
      invalidJSXPosition: 'JSX of Vue2 must be located in class method or object method'
    },

    schema: []
  },

  create(context) {
    return {
      // eslint-disable-next-line sonarjs/cognitive-complexity
      JSXElement(node) {
        let { parent } = node
        let valid = false
        while (parent && parent.type !== 'Program') {
          if (parent.type === 'FunctionExpression') {
            const gp = parent.parent
            if (gp && gp.type === 'Property' && (gp.method || gp.kind === 'get' || gp.kind === 'set')) { // must be es6 object method
              const ggp = gp.parent
              if (ggp && ggp.type === 'ObjectExpression') {
                valid = true
                break
              }
            }
            if (gp && gp.type === 'MethodDefinition') {
              const ggp = gp.parent
              if (ggp && ggp.type === 'ClassBody') {
                valid = true
                break
              }
            }
          }
          parent = parent.parent
        }
        if (!valid) {
          context.report({
            node,
            messageId: 'invalidJSXPosition'
          })
        }
      },
    }
  }
}
