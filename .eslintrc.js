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
    'eslint:recommended',
    'plugin:vue/vue3-essential',
    '@vue/eslint-config-typescript',
    'plugin:vue/vue3-strongly-recommended',
    'plugin:vuetify/base'
  ],
  rules: {
    'vue/multi-word-component-names': 'off',
    // Note: you must disable the base rule as it can report incorrect errors
    // Bye bye useless characters
    'semi': ['error', 'never'],
    '@typescript-eslint/semi': ['error', 'never'],
    // "vue/multiline-"
    'vue/singleline-html-element-content-newline': ['error', {
      'ignoreWhenNoAttributes': false,
      'ignoreWhenEmpty': true,
      'ignores': ['pre', 'textarea', 'v-icon'],
      'externalIgnores': []
    }],
    'vue/html-self-closing': ['error'],
    // Enforce certain multiline behavior
    'vue/multiline-html-element-content-newline': ['error', {
      'ignoreWhenEmpty': true,
      'ignores': ['pre', 'textarea'],
      'allowEmptyLines': false,
    }],
    // Clear empty lines proactively, is very rough
    'no-multiple-empty-lines': ['warn', {
      max: 1
    }],
    // This rule is left like the default, just for showing why formatting is the way it is
    'vue/html-indent': ['error', 2, {
      'attribute': 1,
      'baseIndent': 1,
      'closeBracket': 0,
      'alignAttributesVertically': true,
      'ignores': []
    }],
    'vue/html-closing-bracket-newline': [
      'error',
      {
        'singleline': 'never',
        'multiline': 'never',
        'selfClosingTag': {
          'singleline': 'never',
          'multiline': 'never'
        }
      }],
    'vue/new-line-between-multi-line-property': ['error', {
      'minLineOfMultilineProperty': 2
    }],
    'vue/mustache-interpolation-spacing': ['error', 'always'],
    'vue/block-lang': ['error',
      {
        'script': {
          'lang': 'ts'
        }
      }],
    'vue/no-unused-vars': ['error', {}],
    'vue/no-ref-object-reactivity-loss': ['error'],
    // "vue/no-undef-components": ["error", {
    //   "ignorePatterns": []
    // }],
    'vue/require-typed-object-prop': 'error',
    'vue/valid-v-on': ['error', {
      'modifiers': []
    }],
    'quotes':['error','single'],
    '@typescript-eslint/indent': ['error',2]
  }
}
