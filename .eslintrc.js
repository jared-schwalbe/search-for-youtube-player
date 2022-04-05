module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  globals: {
    $: 'readonly',
    chrome: 'readonly',
    state: 'readonly',
  },
  extends: [
    'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'no-plusplus': 'off',
  },
};
