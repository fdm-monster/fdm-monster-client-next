/**
 * .eslint.js
 *
 * ESLint configuration file.
 */
module.exports = {
  root: true,
  env: {
    node: true
  },
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser'
  },
  plugins: ['vue', 'prettier'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'eslint:recommended',
    '@vue/eslint-config-typescript',
    'plugin:vue/vue3-recommended',
    'prettier',
    'plugin:vuetify/base'
  ],
  rules: {
    'vue/multi-word-component-names': 'off',
    'prettier/prettier': ['error'],
    // Note: you must disable the base rule as it can report incorrect errors
    // Bye bye useless characters
    // semi: ['error', 'never'],
    // '@typescript-eslint/semi': ['error', 'never'],
    // // "vue/multiline-"
    // 'vue/singleline-html-element-content-newline': [
    //   'error',
    //   {
    //     ignoreWhenNoAttributes: false,
    //     ignoreWhenEmpty: true,
    //     ignores: ['pre', 'textarea', 'v-icon'],
    //     externalIgnores: []
    //   }
    // ],
    'vue/html-self-closing': [
      'error',
      {
        html: {
          void: 'always',
          normal: 'always',
          component: 'always'
        },
        svg: 'always',
        math: 'always'
      }
    ],
    // // Enforce certain multiline behavior
    // 'vue/multiline-html-element-content-newline': [
    //   'error',
    //   {
    //     ignoreWhenEmpty: true,
    //     ignores: ['pre', 'textarea'],
    //     allowEmptyLines: false
    //   }
    // ],
    // // Clear empty lines proactively, is very rough
    // 'no-multiple-empty-lines': [
    //   'warn',
    //   {
    //     max: 1
    //   }
    // ],
    // // This rule is left like the default, just for showing why formatting is the way it is
    // 'vue/html-indent': [
    //   'error',
    //   2,
    //   {
    //     attribute: 1,
    //     baseIndent: 1,
    //     closeBracket: 0,
    //     alignAttributesVertically: true,
    //     ignores: []
    //   }
    // ],
    // 'vue/html-closing-bracket-newline': [
    //   'error',
    //   {
    //     singleline: 'never',
    //     multiline: 'never',
    //     selfClosingTag: {
    //       singleline: 'never',
    //       multiline: 'never'
    //     }
    //   }
    // ]
    // 'vue/new-line-between-multi-line-property': [
    //   'error',
    //   {
    //     minLineOfMultilineProperty: 2
    //   }
    // ],
    'vue/block-lang': [
      'error',
      {
        script: {
          lang: 'ts'
        }
      }
    ],
    'vue/no-unused-vars': ['error', {}],
    // // Throws an error ast undefined
    // '@typescript-eslint/no-unused-vars': ['off'],
    'vue/no-ref-object-reactivity-loss': ['error']
    // "vue/no-undef-components": ["error", {
    //   "ignorePatterns": []
    // }],
    // 'vue/require-typed-object-prop': 'error',
    // 'vue/valid-v-on': [
    //   'error',
    //   {
    //     modifiers: []
    //   }
    // ],
    // Let prettier fix this
    // quotes: ['error', 'single'],
    // '@typescript-eslint/indent': ['error', 2],
    // // {var:val} in f.e. template activator
    // 'vue/object-curly-spacing': 'error',
  }
}
