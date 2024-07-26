const stream = require('stream');
const stripAnsi = require('strip-ansi');
const os = require('os');
const pid = process.pid;

const LogLevel = {
  INFO: 'info',
  ERROR: 'error'
};

const CollectLogsHook = {
  storage: {},
  collectLogs: ['info', 'error'],
  hostname: null,
  pid,
  pendingLogs: [],
  isInitializationFailed: false,
  enableConsoleOutput: process.env.NODE_ENV !== 'production'
};

const timeoutId = setTimeout(() => {
  CollectLogsHook.addEmptyStreamToLogs();
  CollectLogsHook.isInitializationFailed = true;
  console.error('Error: Unable to initialize the errsole');
}, 10000);

CollectLogsHook.initialize = function (options) {
  this.storage = options.storage;
  this.hostname = options.serverName || os.hostname();
  if (options && typeof options.enableConsoleOutput !== 'undefined') {
    this.enableConsoleOutput = options.enableConsoleOutput;
  }
  if (this.storage.once) {
    this.storage.once('ready', () => {
      clearTimeout(timeoutId);
      if (this.isInitializationFailed) {
        this.initializeLogStream();
        this.isInitializationFailed = false;
      } else {
        this.logStream.uncork();
      }
    });
  }
  this.collectLogs = options.collectLogs || ['info', 'error'];
  if (this.collectLogs.includes(LogLevel.INFO)) {
    console.log('Errsole is capturing INFO logs.');
  } else {
    process.stdout.write = originalStdoutWrite;
    console.log('Errsole is NOT capturing INFO logs.');
  }
  if (this.collectLogs.includes(LogLevel.ERROR)) {
    console.log('Errsole is capturing ERROR logs.');
  } else {
    process.stderr.write = originalStderrWrite;
    console.log('Errsole is NOT capturing ERROR logs.');
  }
};

CollectLogsHook.captureLogs = function (level) {
  const self = this;

  const setWriteFunction = (writeFunction) => {
    const originalWrite = writeFunction.write;
    writeFunction.write = (chunk, encoding, done) => {
      const cleanedChunk = stripAnsi(chunk.toString());
      const logEntry = {
        timestamp: new Date().toISOString(),
        message: cleanedChunk,
        source: 'console',
        level,
        hostname: self.hostname || '',
        pid: self.pid || 0
      };
      self.logStream.write(logEntry);
      if (self.enableConsoleOutput) {
        originalWrite.call(writeFunction, chunk, encoding, done);
      } else if (done) {
        done(); // Ensure callback is called if provided
      }
    };
  };

  if (self.storage.once) {
    self.storage.once('ready', function () {
      if (!self.enableConsoleOutput) {
        setWriteFunction(level === LogLevel.INFO ? process.stdout : process.stderr);
      }
    });
  }

  setWriteFunction(level === LogLevel.INFO ? process.stdout : process.stderr);
};

// start capturing stdout, stderr and storing in logStream from app start
const originalStdoutWrite = process.stdout.write;
const originalStderrWrite = process.stderr.write;

if (CollectLogsHook.collectLogs.includes(LogLevel.INFO)) {
  CollectLogsHook.captureLogs(LogLevel.INFO);
}

if (CollectLogsHook.collectLogs.includes(LogLevel.ERROR)) {
  CollectLogsHook.captureLogs(LogLevel.ERROR);
}

CollectLogsHook.customLogger = function (level, message, metadata) {
  try {
    const logEntry = { timestamp: new Date().toISOString(), message, meta: metadata || '{}', source: 'errsole', level, hostname: this.hostname || '', pid: this.pid || 0 };
    this.logStream.write(logEntry);
  } catch (err) { }
};

CollectLogsHook.initializeLogStream = function () {
  this.logStream = new stream.Writable({
    objectMode: true,
    write (logEntry, encoding, callback) {
      CollectLogsHook.storage.postLogs([logEntry]);
      setImmediate(() => callback());
    }
  });
};

try {
  CollectLogsHook.initializeLogStream();
  if (CollectLogsHook.logStream) {
    CollectLogsHook.logStream.cork();
  } else {
    throw new Error('Failed to initialize log stream');
  }
} catch (error) {
  console.error('Error initializing or corking log stream:', error);
}

CollectLogsHook.addEmptyStreamToLogs = function () {
  this.logStream.destroy();
  this.logStream = new stream.Writable({
    objectMode: true,
    write (logEntry, encoding, callback) {
      setImmediate(() => callback());
    }
  });
};

CollectLogsHook.clearLogsBeforeExit = async function (timeout = 5000) {
  if (typeof this.storage.flushLogs === 'function') {
    try {
      await Promise.race([
        this.storage.flushLogs(),
        new Promise((resolve, reject) => setTimeout(() => reject(new Error('flushLogs timed out')), timeout))
      ]);
    } catch (err) { }
  }
};

module.exports = CollectLogsHook;
