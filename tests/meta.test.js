/* globals expect, jest, beforeEach, afterEach, afterAll, describe, it */
jest.mock('http-proxy-middleware', () => ({
  createProxyMiddleware: jest.fn(),
  fixRequestBody: jest.fn()
}), { virtual: true });
jest.mock('koa-proxies', () => jest.fn(), { virtual: true });
jest.mock('@hapi/h2o2', () => ({}), { virtual: true });

const Errsole = require('../lib/errsole');
const ErrsoleMain = require('../lib/main');
const Logs = require('../lib/main/logs');

describe('Errsole.meta with circular and normal objects', () => {
  let customLoggerSpy;

  beforeEach(() => {
    customLoggerSpy = jest.spyOn(ErrsoleMain, 'customLogger').mockImplementation(() => {});
  });

  afterEach(() => {
    customLoggerSpy.mockRestore();
  });

  afterAll(() => {
    if (Logs.initializationTimeoutId) {
      clearTimeout(Logs.initializationTimeoutId);
    }
  });

  it('should serialize normal metadata using JSON.stringify', () => {
    const normalMeta = { user: 'Alice', role: 'admin', count: 42 };
    Errsole.meta(normalMeta).info('user logged in');

    expect(customLoggerSpy).toHaveBeenCalledTimes(1);
    const [level, message, metadataString] = customLoggerSpy.mock.calls[0];
    expect(level).toBe('info');
    expect(message).toBe('user logged in');

    const parsed = JSON.parse(metadataString);
    expect(parsed).toEqual(normalMeta);
  });

  it('should safely convert circular objects in meta using fast-safe-stringify in fallback', () => {
    const circularMeta = { name: 'circular-test', details: { id: 101 } };
    circularMeta.self = circularMeta;
    circularMeta.details.parent = circularMeta;

    Errsole.meta(circularMeta).error('an error occurred');

    expect(customLoggerSpy).toHaveBeenCalledTimes(1);
    const [level, message, metadataString] = customLoggerSpy.mock.calls[0];
    expect(level).toBe('error');
    expect(message).toBe('an error occurred');

    // Must be valid JSON
    expect(() => JSON.parse(metadataString)).not.toThrow();
    const parsed = JSON.parse(metadataString);
    expect(parsed.name).toBe('circular-test');
    expect(parsed.details.id).toBe(101);
    expect(parsed.self).toBe('[Circular]');
    expect(parsed.details.parent).toBe('[Circular]');
  });

  it('should preserve non-circular repeated references (DAG)', () => {
    const shared = { sharedKey: 'sharedValue' };
    const dagMeta = { ref1: shared, ref2: shared };

    Errsole.meta(dagMeta).info('dag test');

    expect(customLoggerSpy).toHaveBeenCalledTimes(1);
    const [, , metadataString] = customLoggerSpy.mock.calls[0];
    const parsed = JSON.parse(metadataString);
    expect(parsed.ref1).toEqual({ sharedKey: 'sharedValue' });
    expect(parsed.ref2).toEqual({ sharedKey: 'sharedValue' });
  });

  it('should handle primitive metadata values', () => {
    Errsole.meta('simple string metadata').warn('warning msg');

    expect(customLoggerSpy).toHaveBeenCalledTimes(1);
    const [level, message, metadataString] = customLoggerSpy.mock.calls[0];
    expect(level).toBe('warn');
    expect(message).toBe('warning msg');
    expect(metadataString).toBe('simple string metadata');
  });

  it('should work across all logger levels (alert, error, warn, debug, info, log)', () => {
    const obj = { active: true };
    obj.cycle = obj;

    const levels = ['alert', 'error', 'warn', 'debug', 'info', 'log'];
    levels.forEach((lvl) => {
      Errsole.meta(obj)[lvl](`Testing ${lvl}`);
    });

    expect(customLoggerSpy).toHaveBeenCalledTimes(levels.length);
    levels.forEach((lvl, idx) => {
      const [calledLevel, calledMessage, metadataString] = customLoggerSpy.mock.calls[idx];
      expect(calledLevel).toBe(lvl === 'log' ? 'info' : lvl);
      expect(calledMessage).toBe(`Testing ${lvl}`);
      expect(JSON.parse(metadataString).cycle).toBe('[Circular]');
    });
  });

  it('should fallback to String(this.metadata) if fast-safe-stringify throws', () => {
    const problematicObj = {};
    Object.defineProperty(problematicObj, 'boom', {
      get () {
        throw new Error('Getter failed');
      },
      enumerable: true
    });

    Errsole.meta(problematicObj).error('getter error');

    expect(customLoggerSpy).toHaveBeenCalledTimes(1);
    const [, , metadataString] = customLoggerSpy.mock.calls[0];
    expect(metadataString).toBe('[object Object]');
  });
});
