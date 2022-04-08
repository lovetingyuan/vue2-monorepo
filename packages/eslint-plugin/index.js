module.exports = {
  rules: {
    'require-jsx-ext': require('./rules/require-jsx-ext'),
    'valid-jsx-h-inject': require('./rules/valid-jsx-h-inject'),
  },
  configs: {
    vue2: require('./configs/vue2'),
    node: require('./configs/node'),
    base: require('./configs/base'),
  },
}
