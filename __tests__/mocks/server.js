/**
 * __tests__/mocks/server.js
 * MSW Node server — used by jest.setup.js and imported in test files.
 */
const { setupServer } = require('msw/node');
const { handlers } = require('./handlers');

const server = setupServer(...handlers);

module.exports = { server };
