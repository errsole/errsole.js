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
  collectLogs: [],
  hostname: null,
  pid,
  enableConsoleOutput: true
};

CollectLogsHook.initialize = function (options) {
  this.storage = options.storage;
  this.hostname = options.serverName || os.hostname();
  if (options && typeof options.enableConsoleOutput !== 'undefined') {
    this.enableConsoleOutput = options.enableConsoleOutput;
  }
  this.collectLogs = options.collectLogs || ['info', 'error'];
  if (this.collectLogs.includes(LogLevel.INFO)) {
    this.captureLogs(LogLevel.INFO);
    console.log('Errsole is capturing INFO logs.');
  } else {
    console.log('Errsole is NOT capturing INFO logs.');
  }
  if (this.collectLogs.includes(LogLevel.ERROR)) {
    this.captureLogs(LogLevel.ERROR);
    console.log('Errsole is capturing ERROR logs.');
  } else {
    console.log('Errsole is NOT capturing ERROR logs.');
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
      const logEntry = { timestamp: new Date().toISOString(), message: cleanedChunk, source: 'console', level, hostname: this.hostname || '', pid: this.pid || 0 };
      self.storage.postLogs([logEntry]);
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

CollectLogsHook.customLogger = function (level, message, metadata) {
  try {
    const logEntry = { timestamp: new Date().toISOString(), message, meta: metadata, source: 'errsole', level, hostname: this.hostname || '', pid: this.pid || 0 };
    this.storage.postLogs([logEntry]);
  } catch (err) { }
};

module.exports = CollectLogsHook;
