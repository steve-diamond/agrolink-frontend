/**
 * __mocks__/until-async.js
 * CJS stub for `until-async` which is ESM-only.
 * Used by MSW's experimental frame handlers.
 */
async function until(callback) {
  try {
    return [null, await callback().catch((error) => { throw error; })];
  } catch (error) {
    return [error, null];
  }
}

module.exports = { until };
