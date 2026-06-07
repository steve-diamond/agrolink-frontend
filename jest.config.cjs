// jest.config.cjs — CJS format required because package.json has "type":"module"
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
});

/** @type {import('jest').Config} */
const customConfig = {
  // Use jsdom to simulate the browser environment
  testEnvironment: 'jest-environment-jsdom',

  // Run this file after jest is set up (jest-dom matchers, MSW server, etc.)
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  // ── Module name mapping ─────────────────────────────────────────────────────
  // Mirror the paths from tsconfig.json so imports resolve correctly in tests
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@services/(.*)$': '<rootDir>/services/$1',
    '^@lib/(.*)$': '<rootDir>/lib/$1',
    // Static asset stubs
    '\\.(css|less|scss|sass)$': '<rootDir>/__mocks__/styleMock.cjs',
    '\\.(jpg|jpeg|png|gif|webp|avif|svg|ico)$': '<rootDir>/__mocks__/fileMock.cjs',
  },

  // ── Coverage ────────────────────────────────────────────────────────────────
  collectCoverageFrom: [
    'components/**/*.{ts,tsx}',
    'app/**/*.{ts,tsx}',
    'hooks/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/*.stories.{ts,tsx}',
    '!app/**/layout.tsx',
    '!app/**/page.tsx',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],
  coverageDirectory: 'coverage',

  // ── Test matching ──────────────────────────────────────────────────────────
  testMatch: [
    '**/__tests__/**/*.test.{ts,tsx}',
    '**/*.test.{ts,tsx}',
    '**/*.spec.{ts,tsx}',
  ],
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.next/',
    '<rootDir>/backend/',
  ],

  // ── Transform ───────────────────────────────────────────────────────────────
  // next/jest handles TypeScript + JSX via SWC; add additional transform ignores
  transformIgnorePatterns: [
    'node_modules/(?!(framer-motion|@heroicons)/)',
  ],
};

module.exports = createJestConfig(customConfig);
