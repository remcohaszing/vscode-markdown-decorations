import { define } from '@remcohaszing/eslint'

export default define([
  {
    rules: {
      'import-x/no-extraneous-dependencies': ['error', { devDependencies: true }]
    }
  }
])
