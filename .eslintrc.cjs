module.exports = {
  root: true,
  env: {
    node: true,
    es2021: true,
    browser: true,
    jest: true,
    vitest: true,
  },
  globals: {
    test: 'readonly',
    expect: 'readonly',
    describe: 'readonly',
    it: 'readonly',
    beforeEach: 'readonly',
    afterEach: 'readonly',
    vi: 'readonly',
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
