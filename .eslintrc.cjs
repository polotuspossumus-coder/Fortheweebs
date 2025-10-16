module.exports = {
  root: true,
  env: {
    node: true,
    es2021: true,
    browser: true,
    jest: true,
  },
  globals: {
    test: 'readonly',
    expect: 'readonly',
    process: 'readonly',
  },
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
  rules: {
    'no-unused-vars': 'off',
    'no-undef': 'off',
  },
};
