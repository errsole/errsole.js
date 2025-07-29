const logCollector = require('../../lib/main/logs/index');
const os = require('os');
/* globals expect, jest, beforeEach, afterEach, describe, afterAll, test, beforeAll */

describe('logCollector', () => {
  let storageMock;
  let originalStdoutWrite;
  let originalStderrWrite;
  let mockStdoutWrite;
  let mockStderrWrite;
  let logSpy;
  let errorSpy;
  let originalConsoleError;
  let activeTimeouts = [];
  let activeIntervals = [];

  beforeAll(() => {
    originalConsoleError = console.error;
    console.error = jest.fn();
  });

  afterAll(() => {
    console.error = originalConsoleError;
  });

  beforeEach(() => {
    storageMock = {
      postLogs: jest.fn(),
      once: jest.fn((event, callback) => {
        if (event === 'ready') {
          callback();
        }
      }),
      flushLogs: jest.fn(() => Promise.resolve())
    };

    originalStdoutWrite = process.stdout.write;
    originalStderrWrite = process.stderr.write;
    mockStdoutWrite = jest.fn();
    mockStderrWrite = jest.fn();
    process.stdout.write = mockStdoutWrite;
    process.stderr.write = mockStderrWrite;

    logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const originalSetTimeout = global.setTimeout;
    jest.spyOn(global, 'setTimeout').mockImplementation((fn, delay) => {
      const timeout = originalSetTimeout(fn, delay);
      activeTimeouts.push(timeout);
      return timeout;
    });

    const originalSetInterval = global.setInterval;
    jest.spyOn(global, 'setInterval').mockImplementation((fn, delay) => {
      const interval = originalSetInterval(fn, delay);
      activeIntervals.push(interval);
      return interval;
    });
  });

  afterEach(() => {
    process.stdout.write = originalStdoutWrite;
    process.stderr.write = originalStderrWrite;

    logSpy.mockRestore();
    errorSpy.mockRestore();

    activeTimeouts.forEach(timeout => clearTimeout(timeout));
    activeTimeouts = [];

    activeIntervals.forEach(interval => clearInterval(interval));
    activeIntervals = [];

    jest.clearAllMocks();
  });

  afterAll(async () => {
    if (typeof logCollector.storage.flushLogs === 'function') {
      await logCollector.flushLogs();
    }
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  describe('flushLogs', () => {
    test('should call storage.flushLogs with a timeout', async () => {
      logCollector.storage = storageMock;
      const flushLogsSpy = jest.spyOn(logCollector.storage, 'flushLogs');

      await logCollector.flushLogs();

      expect(flushLogsSpy).toHaveBeenCalled();
    });

    test('should handle flushLogs timeout', async () => {
      logCollector.storage = storageMock;
      storageMock.flushLogs.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 6000))); // Mock a delay

      await logCollector.flushLogs(5000);

      expect(console.error).toHaveBeenCalledWith(new Error('flushLogs timed out'));
    });
  });

  describe('initialize', () => {
    test('should set storage and collectLogs', () => {
      const options = {
        storage: storageMock,
        collectLogs: ['info', 'error'],
        enableConsoleOutput: true,
        serverName: 'test-server'
      };

      logCollector.initialize(options);

      expect(logCollector.storage).toBe(options.storage);
      expect(logCollector.collectLogs).toEqual(options.collectLogs);
      expect(logCollector.enableConsoleOutput).toBe(options.enableConsoleOutput);
      expect(logCollector.hostname).toBe(options.serverName);
    });

    test('should set default collectLogs if not provided', () => {
      const options = {
        storage: storageMock
      };

      logCollector.initialize(options);

      expect(logCollector.collectLogs).toEqual(['info', 'error']);
    });

    test('should set hostname to os.hostname if serverName not provided', () => {
      const options = {
        storage: storageMock
      };

      logCollector.initialize(options);

      expect(logCollector.hostname).toBe(os.hostname());
    });

    test('should intercept logs for info and error levels', () => {
      const options = {
        storage: storageMock,
        collectLogs: ['info', 'error']
      };

      const interceptLogsSpy = jest.spyOn(logCollector, 'interceptLogs');
      logCollector.initialize(options);

      expect(interceptLogsSpy).toHaveBeenCalledWith('info');
      expect(interceptLogsSpy).toHaveBeenCalledWith('error');
      interceptLogsSpy.mockRestore();
    });

    test('should not intercept logs if level is not included in collectLogs', () => {
      const options = {
        storage: storageMock,
        collectLogs: ['error']
      };

      const interceptLogsSpy = jest.spyOn(logCollector, 'interceptLogs');
      logCollector.initialize(options);

      expect(interceptLogsSpy).not.toHaveBeenCalledWith('info');
      expect(interceptLogsSpy).toHaveBeenCalledWith('error');
      interceptLogsSpy.mockRestore();
    });

    test('should create log stream if initialization failed', () => {
      logCollector.isInitializationFailed = true;
      const createLogStreamSpy = jest.spyOn(logCollector, 'createLogStream');
      const options = {
        storage: storageMock
      };

      logCollector.initialize(options);
      storageMock.once.mock.calls[0][1]();

      expect(createLogStreamSpy).toHaveBeenCalled();
      expect(logCollector.isInitializationFailed).toBe(false);
    });

    test('should uncork log stream if initialization did not fail', () => {
      logCollector.isInitializationFailed = false;
      logCollector.logStream = { uncork: jest.fn() };
      const uncorkSpy = jest.spyOn(logCollector.logStream, 'uncork');
      const options = {
        storage: storageMock
      };

      logCollector.initialize(options);
      storageMock.once.mock.calls[0][1]();

      expect(uncorkSpy).toHaveBeenCalled();
    });

    test('should not capture info logs if not included in collectLogs', () => {
      const options = {
        storage: storageMock,
        collectLogs: ['error'],
        enableConsoleOutput: false
      };

      logCollector.initialize(options);

      expect(process.stdout.write).toEqual(expect.any(Function));
      expect(() => {
        process.stdout.write('', null, () => {});
      }).not.toThrow();
    });

    test('should not capture error logs if not included in collectLogs', () => {
      const options = {
        storage: storageMock,
        collectLogs: ['info'],
        enableConsoleOutput: false
      };

      logCollector.initialize(options);

      expect(process.stderr.write).toEqual(expect.any(Function));
      expect(() => {
        process.stderr.write('', null, () => {});
      }).not.toThrow();
    });
    test('logCustomMessage should write to stdout if enableConsoleOutput is true', () => {
      logCollector.logStream = { write: jest.fn() };
      logCollector.enableConsoleOutput = true;

      const stdoutSpy = jest.spyOn(logCollector.originalStdoutWrite, 'call').mockImplementation(() => {});
      logCollector.logCustomMessage('info', 'Test message');

      expect(stdoutSpy).toHaveBeenCalled();
      stdoutSpy.mockRestore();
    });
  });

  describe('createLogStream', () => {
    test('should create a writable log stream that posts logs to storage', () => {
      logCollector.storage = storageMock;
      logCollector.createLogStream();

      const logEntry = { message: 'test log' };
      logCollector.logStream.write(logEntry);

      expect(storageMock.postLogs).toHaveBeenCalledWith([logEntry]);
    });
  });

  describe('createEmptyLogStream', () => {
    test('should destroy existing log stream if present', () => {
      const destroySpy = jest.fn();
      logCollector.logStream = { destroy: destroySpy };

      logCollector.createEmptyLogStream();

      expect(destroySpy).toHaveBeenCalled();
    });
    test('createEmptyLogStream should call destroy on existing logStream', () => {
      const destroySpy = jest.fn();
      logCollector.logStream = { destroy: destroySpy };

      logCollector.createEmptyLogStream();

      expect(destroySpy).toHaveBeenCalled();
    });
  });

  describe('interceptLogs', () => {
    beforeEach(() => {
      jest.spyOn(logCollector.logStream, 'write').mockImplementation(() => {});
      logCollector.originalStdoutWrite = process.stdout.write;
      logCollector.originalStderrWrite = process.stderr.write;
      process.stdout.write = jest.fn();
      process.stderr.write = jest.fn();
    });

    afterEach(() => {
      jest.restoreAllMocks();
      process.stdout.write = logCollector.originalStdoutWrite;
      process.stderr.write = logCollector.originalStderrWrite;
    });

    test('should intercept stdout logs and write to logStream', () => {
      logCollector.interceptLogs('info');
      const logMessage = 'info log message';
      process.stdout.write(logMessage);

      expect(logCollector.logStream.write).toHaveBeenCalledWith(expect.objectContaining({
        message: logMessage,
        level: 'info'
      }));
    });

    test('should intercept stderr logs and write to logStream', () => {
      logCollector.interceptLogs('error');
      const logMessage = 'error log message';
      process.stderr.write(logMessage);

      expect(logCollector.logStream.write).toHaveBeenCalledWith(expect.objectContaining({
        message: logMessage,
        level: 'error'
      }));
    });

    test('should return early if unsupported log level is provided', () => {
      const result = logCollector.interceptLogs('debug');
      expect(result).toBeUndefined();

      // Ensure original write methods are not overridden
      expect(process.stdout.write).toEqual(expect.any(Function));
      expect(process.stderr.write).toEqual(expect.any(Function));
    });

    test('should strip ANSI characters from log messages', () => {
      const stripAnsi = require('strip-ansi');
      logCollector.interceptLogs('info');
      const logMessage = '\u001b[31mred text\u001b[39m';
      process.stdout.write(logMessage);

      expect(logCollector.logStream.write).toHaveBeenCalledWith(expect.objectContaining({
        message: stripAnsi(logMessage),
        level: 'info'
      }));
    });

    test('should call original write method if enableConsoleOutput is true', () => {
      logCollector.enableConsoleOutput = true;
      logCollector.interceptLogs('info');
      const logMessage = 'info log message';
      const originalWriteSpy = jest.spyOn(logCollector.originalStdoutWrite, 'call').mockImplementation(() => {});

      process.stdout.write(logMessage);

      expect(originalWriteSpy).toHaveBeenCalledWith(expect.any(Object), logMessage, undefined, undefined);
      originalWriteSpy.mockRestore();
    });

    test('should call done if enableConsoleOutput is false', () => {
      logCollector.enableConsoleOutput = false;
      logCollector.interceptLogs('info');
      const logMessage = 'info log message';
      const done = jest.fn();

      process.stdout.write(logMessage, 'utf-8', done);

      expect(done).toHaveBeenCalled();
    });
  });

  describe('logCustomMessage', () => {
    beforeEach(() => {
      jest.spyOn(logCollector.logStream, 'write').mockImplementation(() => {});
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    test('should log a custom message with metadata', () => {
      const level = 'info';
      const message = 'custom log message';
      const metadata = { key: 'value' };

      logCollector.logCustomMessage(level, message, metadata);

      expect(logCollector.logStream.write).toHaveBeenCalledWith(expect.objectContaining({
        message,
        level,
        meta: metadata
      }));
    });

    test('should log a custom message without metadata', () => {
      const level = 'error';
      const message = 'custom log message';

      logCollector.logCustomMessage(level, message);

      expect(logCollector.logStream.write).toHaveBeenCalledWith(expect.objectContaining({
        message,
        level,
        meta: '{}'
      }));
    });

    test('should log a custom message and handle write errors', () => {
      const level = 'info';
      const message = 'custom log message';
      const metadata = { key: 'value' };
      const error = new Error('Write error');
      jest.spyOn(logCollector.logStream, 'write').mockImplementation(() => {
        throw error;
      });

      logCollector.logCustomMessage(level, message, metadata);

      expect(console.error).toHaveBeenCalledWith(error);
    });
  });

  describe('resetConsoleOutput', () => {
    test('should restore console output and uncork logStream', () => {
      const uncorkSpy = jest.fn();
      logCollector.logStream = {
        uncork: uncorkSpy,
        write: jest.fn()
      };
      logCollector.enableConsoleOutput = false;

      const originalStdout = process.stdout.write;
      const originalStderr = process.stderr.write;

      logCollector.resetConsoleOutput();

      expect(logCollector.enableConsoleOutput).toBe(true);
      expect(process.stdout.write).toBe(logCollector.originalStdoutWrite);
      expect(process.stderr.write).toBe(logCollector.originalStderrWrite);
      expect(uncorkSpy).toHaveBeenCalled();

      process.stdout.write = originalStdout;
      process.stderr.write = originalStderr;
    });
  });

  describe('setInitializationTimeout', () => {
    test('should mark initialization failed and create empty log stream', () => {
      jest.useFakeTimers();
      const createEmptyLogStreamSpy = jest.spyOn(logCollector, 'createEmptyLogStream');

      // ✅ Provide a mock logStream with a destroy() method
      logCollector.logStream = { destroy: jest.fn() };

      logCollector.setInitializationTimeout();
      jest.runAllTimers();

      expect(createEmptyLogStreamSpy).toHaveBeenCalled();
      expect(logCollector.isInitializationFailed).toBe(true);
      expect(console.error).toHaveBeenCalledWith('Error: Unable to initialize Errsole');

      jest.useRealTimers();
      createEmptyLogStreamSpy.mockRestore();
    });
  });

  describe('initialize swallowWrite', () => {
    test('should not throw when stdout.write is called without a callback', () => {
      const options = { storage: storageMock, enableConsoleOutput: false };
      logCollector.initialize(options);

      expect(() => {
        process.stdout.write('test message'); // no callback passed
      }).not.toThrow();
    });
  });
});
