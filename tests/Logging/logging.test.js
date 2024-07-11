const CollectLogsHook = require('../../lib/main/logs/index');
const os = require('os');
const { it } = require('@jest/globals');
/* globals expect, jest, beforeEach, afterEach, describe */

describe('CollectLogsHook', () => {
  let mockStorage;
  let originalStdoutWrite;
  let originalStderrWrite;
  let mockStdoutWrite;
  let mockStderrWrite;

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
  });

  afterEach(() => {
    process.stdout.write = originalStdoutWrite;
    process.stderr.write = originalStderrWrite;
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
});
