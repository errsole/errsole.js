const CollectLogsHook = require('../../lib/main/logs/index'); // replace with the actual path to the file
const os = require('os');
const stream = require('stream');
const stripAnsi = require('strip-ansi');
/* globals expect, jest, beforeEach, afterEach, describe, it */

describe('CollectLogsHook', () => {
  let mockStorage;
  let originalStdoutWrite;
  let originalStderrWrite;
  let mockStdoutWrite;
  let mockStderrWrite;
  let logSpy;
  let errorSpy;

  beforeEach(() => {
    mockStorage = {
      postLogs: jest.fn(),
      once: jest.fn((event, callback) => {
        if (event === 'ready') {
          callback();
        }
      })
    };

    originalStdoutWrite = process.stdout.write;
    originalStderrWrite = process.stderr.write;
    mockStdoutWrite = jest.fn();
    mockStderrWrite = jest.fn();
    process.stdout.write = mockStdoutWrite;
    process.stderr.write = mockStderrWrite;

    // Resetting the CollectLogsHook state before each test
    CollectLogsHook.storage = {};
    CollectLogsHook.collectLogs = [];
    CollectLogsHook.hostname = null;
    CollectLogsHook.enableConsoleOutput = true;

    // Mocking console.log and console.error
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    process.stdout.write = originalStdoutWrite;
    process.stderr.write = originalStderrWrite;

    // Restore original implementations
    logSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it('should initialize with default options', () => {
    CollectLogsHook.initialize({ storage: mockStorage });

    expect(CollectLogsHook.storage).toBe(mockStorage);
    expect(CollectLogsHook.hostname).toBe(os.hostname());
    expect(CollectLogsHook.enableConsoleOutput).toBe(true);
    expect(CollectLogsHook.collectLogs).toEqual(['info', 'error']);
  });

  it('should initialize with custom options', () => {
    const options = {
      storage: mockStorage,
      serverName: 'custom-server',
      enableConsoleOutput: false,
      collectLogs: ['info']
    };

    CollectLogsHook.initialize(options);

    expect(CollectLogsHook.storage).toBe(mockStorage);
    expect(CollectLogsHook.hostname).toBe('custom-server');
    expect(CollectLogsHook.enableConsoleOutput).toBe(false);
    expect(CollectLogsHook.collectLogs).toEqual(['info']);
  });

  it('should not capture logs if not specified', () => {
    CollectLogsHook.initialize({ storage: mockStorage, collectLogs: [] });
    const infoMessage = 'Info log message';
    const errorMessage = 'Error log message';

    process.stdout.write(infoMessage);
    process.stderr.write(errorMessage);

    expect(mockStdoutWrite).toHaveBeenCalledWith(infoMessage);
    expect(mockStderrWrite).toHaveBeenCalledWith(errorMessage);
    expect(mockStorage.postLogs).not.toHaveBeenCalled();
  });

  it('should capture info logs', (done) => {
    CollectLogsHook.initialize({ storage: mockStorage, collectLogs: ['info'] });
    const infoMessage = 'Info log message';

    process.stdout.write(infoMessage);

    setImmediate(() => {
      expect(mockStdoutWrite).toHaveBeenCalledWith(infoMessage);
      expect(mockStorage.postLogs).toHaveBeenCalledWith([expect.objectContaining({ message: stripAnsi(infoMessage), level: 'info' })]);
      done();
    });
  });

  it('should capture error logs', (done) => {
    CollectLogsHook.initialize({ storage: mockStorage, collectLogs: ['error'] });
    const errorMessage = 'Error log message';

    process.stderr.write(errorMessage);

    setImmediate(() => {
      expect(mockStderrWrite).toHaveBeenCalledWith(errorMessage);
      expect(mockStorage.postLogs).toHaveBeenCalledWith([expect.objectContaining({ message: stripAnsi(errorMessage), level: 'error' })]);
      done();
    });
  });

  it('should not capture info logs when not specified', (done) => {
    CollectLogsHook.initialize({ storage: mockStorage, collectLogs: ['error'] });
    const infoMessage = 'Info log message';

    process.stdout.write(infoMessage);

    setImmediate(() => {
      expect(mockStdoutWrite).toHaveBeenCalledWith(infoMessage);
      expect(mockStorage.postLogs).not.toHaveBeenCalledWith([expect.objectContaining({ message: stripAnsi(infoMessage), level: 'info' })]);
      done();
    });
  });

  it('should log with console output enabled', (done) => {
    CollectLogsHook.initialize({ storage: mockStorage, enableConsoleOutput: true, collectLogs: ['info', 'error'] });

    const infoMessage = 'Info log message';
    const errorMessage = 'Error log message';

    process.stdout.write(infoMessage);
    process.stderr.write(errorMessage);

    setImmediate(() => {
      expect(mockStdoutWrite).toHaveBeenCalledWith(infoMessage);
      expect(mockStderrWrite).toHaveBeenCalledWith(errorMessage);
      expect(mockStorage.postLogs).toHaveBeenCalledWith([expect.objectContaining({ message: stripAnsi(infoMessage), level: 'info' })]);
      expect(mockStorage.postLogs).toHaveBeenCalledWith([expect.objectContaining({ message: stripAnsi(errorMessage), level: 'error' })]);
      done();
    });
  });

  it('should handle error in customLogger', () => {
    CollectLogsHook.initialize({
      storage: mockStorage,
      serverName: 'test-server',
      collectLogs: ['info']
    });

    const faultyLogStream = new stream.Writable({
      objectMode: true,
      write (logEntry, encoding, callback) {
        throw new Error('Test error');
      }
    });

    CollectLogsHook.logStream = faultyLogStream;

    const message = 'Test log message';
    const metadata = { key: 'value' };

    expect(() => CollectLogsHook.customLogger('info', message, metadata)).not.toThrow();
  });

  it('should handle error in writeFunction.write', () => {
    const errorMessage = 'Error log message';
    const options = {
      storage: mockStorage,
      enableConsoleOutput: false,
      collectLogs: ['error']
    };

    CollectLogsHook.initialize(options);

    // Mock logBuffer to simulate an error during write
    const logBufferWriteMock = jest.fn((chunk, encoding, done) => {
      throw new Error('Test error');
    });
    CollectLogsHook.logStream.write = logBufferWriteMock;

    expect(() => {
      process.stderr.write(errorMessage);
    }).not.toThrow();

    // Check that postLogs was not called due to the error
    expect(mockStorage.postLogs).not.toHaveBeenCalled();
  });
});
