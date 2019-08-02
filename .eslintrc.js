module.exports = {
  extends: 'eslint-config-imweb',
  parserOptions: {
    ecmaVersion: 9,
    ecmaFeatures: {
      jsx: false,
    },
    sourceType: 'module',
  },
  env: {
    es6: true,
    node: true,
    jest: true,
  },
  plugins: ['import', 'node', 'promise'],
  globals: {
    window: true,
    document: true,
    App: true,
    Page: true,
    Component: true,
    Behavior: true,
    wx: true,
    getCurrentPages: true,
  },
};
