/**
 * .eslint.js
 *
 * ESLint configuration file.
 */

module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    '@vue/eslint-config-typescript',
  ],
  rules: {
    'vue/multi-word-component-names': 'off',
    // Note: you must disable the base rule as it can report incorrect errors
    "semi": ["error", "never"],
    "@typescript-eslint/semi": ["error", "never"],
    "no-multiple-empty-lines": "warn"
  },
}
