const { isObject } = require('../src/utils');

describe('Utility function: isObject()', () => {
  it('should return `false` for `undefined`', async () => {
    expect(isObject(undefined)).toBe(false);
  });

  it('should return `false` for `null`', async () => {
    expect(isObject(null)).toBe(false);
  });

  it('should return `false` for an array', async () => {
    expect(isObject([])).toBe(false);
  });

  it('should return `true` for a non-`null`, non-array object', async () => {
    expect(isObject({})).toBe(true);
  });
});
