module.exports = {
  ignorePatterns: [
    'frontend/**',
    'backend/**',
    'web/**',
    'mobile/**',
    'models/**/*.js',
    'jest.setup.js',
    'next-env.d.ts',
    'public/sw.js',
    'services/productService.ts',
    'services/useLocalizedCopy.ts',
  ],
  extends: [
    'next/core-web-vitals',
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  rules: {
    'prefer-const': 'error',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    '@next/next/no-img-element': 'warn',
    '@typescript-eslint/no-explicit-any': 'error',
  },
  settings: {
    react: {
      version: "detect"
    }
  },
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
        project: ['./tsconfig.json'],
      },
    },
    {
      files: ['**/*.js', '**/*.jsx'],
      parser: '@babel/eslint-parser',
      parserOptions: {
        requireConfigFile: false,
        babelOptions: {
          presets: ['@babel/preset-react'],
        },
        ecmaVersion: 2020,
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
    },
  ],
};
