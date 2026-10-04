/** Shared ESLint base (flat config helpers) for the Rocket monorepo. */
const js = require('@eslint/js');
const tseslint = require('typescript-eslint');

/** @type {import('eslint').Linter.Config[]} */
module.exports = [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
  {
    ignores: ['dist/**', '.next/**', 'node_modules/**'],
  },
];
