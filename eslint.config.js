const { FlatCompat } = require('@eslint/eslintrc');
const { defineConfig, globalIgnores } = require('eslint/config');
const path = require('path');

const compat = new FlatCompat({ baseDirectory: __dirname });

module.exports = defineConfig([
  ...compat.config({
    extends: ['next/core-web-vitals', 'next/typescript'],
  }),
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    'next.config.js',
    'eslint.config.js',
    // Migrated from .eslintignore
    'next.config.js',
  ]),
  {
    rules: {
      '@next/next/no-css-in-js': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
]);
