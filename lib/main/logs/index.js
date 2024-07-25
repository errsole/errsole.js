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
  enableConsoleOutput: process.env.NODE_ENV !== 'production'
};

const timeoutId = setTimeout(() => {
  CollectLogsHook.addEmptyStreamToLogs();
  console.error('Error: Unable to initialize the errsole');
}, 10000);

CollectLogsHook.initialize = function (options) {
  const self = this;
  this.storage = options.storage;
  this.hostname = options.serverName || os.hostname();
  if (options && typeof options.enableConsoleOutput !== 'undefined') {
    this.enableConsoleOutput = options.enableConsoleOutput;
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
  if (self.storage.once) {
    self.storage.once('ready', function () {
      clearTimeout(timeoutId);
      self.addStreamToLogs();
    });
  }
};

CollectLogsHook.captureLogs = function (level) {
  const self = this;
  if (self.storage.once) {
    self.storage.once('ready', function () {
      if (!self.enableConsoleOutput) {
        const writeFunction = level === LogLevel.INFO ? process.stdout : process.stderr;
        writeFunction.write = function () {
          try {
            const argsArray = Array.from(arguments);
            logBuffer.write.apply(logBuffer, argsArray);
          } catch (err) { }
        };
      }
    });
  }
  const logBuffer = new stream.Writable();
  logBuffer._write = (chunk, encoding, done) => {
    try {
      const cleanedChunk = stripAnsi(chunk.toString());
      const logEntry = { timestamp: new Date().toISOString(), message: cleanedChunk, source: 'console', level, hostname: self.hostname || '', pid: self.pid || 0 };
      self.logStream.write(logEntry);
      done();
    } catch (err) { }
  };

  const originalWrite = level === LogLevel.INFO ? process.stdout.write : process.stderr.write;
  const writeFunction = level === LogLevel.INFO ? process.stdout : process.stderr;

  writeFunction.write = function () {
    try {
      const argsArray = Array.from(arguments);
      originalWrite.apply(writeFunction, argsArray);
      logBuffer.write.apply(logBuffer, argsArray);
    } catch (err) { }
  };
};

// Start capturing logs immediately with default settings
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

CollectLogsHook.logStream = new stream.Writable({
  objectMode: true,
  write (logEntry, encoding, callback) {
    CollectLogsHook.pendingLogs.push(logEntry);
    setImmediate(() => callback());
  }
});

CollectLogsHook.addStreamToLogs = function () {
  this.logStream = new stream.Writable({
    objectMode: true,
    write (logEntry, encoding, callback) {
      CollectLogsHook.storage.postLogs([logEntry]);
      setImmediate(() => callback());
    }
  });
  this.pendingLogs.forEach(logEntry => {
    this.logStream.write(logEntry);
  });
};

CollectLogsHook.addEmptyStreamToLogs = function () {
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
