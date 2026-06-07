/**
 * jest.setup.js
 * Runs once per test file after Jest is initialized.
 * Plain JavaScript — avoids Node 25 native TypeScript stripper incompatibilities.
 * Uses MSW v1 (fully CJS — no polyfills needed).
 */

require('@testing-library/jest-dom');
const { toHaveNoViolations } = require('jest-axe');
const { server } = require('./__tests__/mocks/server');

// ── jest-axe ─────────────────────────────────────────────────────────────────
expect.extend(toHaveNoViolations);

// ── MSW Node Server lifecycle ─────────────────────────────────────────────────
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// ── Mock window.matchMedia ────────────────────────────────────────────────────
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// ── Mock IntersectionObserver ─────────────────────────────────────────────────
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// ── Mock ResizeObserver ───────────────────────────────────────────────────────
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));
