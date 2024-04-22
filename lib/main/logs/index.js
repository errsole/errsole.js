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
  hostname: os.hostname(),
  pid,
  enableConsoleOutput: true
};

CollectLogsHook.initialize = function (options) {
  this.storage = options.storage;
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
          const argsArray = Array.from(arguments);
          logBuffer.write.apply(logBuffer, argsArray);
        };
      }
    });
  }
  const logBuffer = new stream.Writable();
  logBuffer._write = (chunk, encoding, done) => {
    const cleanedChunk = stripAnsi(chunk.toString());
    const logEntry = { timestamp: new Date().toISOString(), message: cleanedChunk, source: 'console', level, hostname: this.hostname || '', pid: this.pid || 0 };
    try { self.storage.postLogs([logEntry]); } catch (err) { }
    done();
  };

  const originalWrite = level === LogLevel.INFO ? process.stdout.write : process.stderr.write;
  const writeFunction = level === LogLevel.INFO ? process.stdout : process.stderr;

  writeFunction.write = function () {
    const argsArray = Array.from(arguments);
    originalWrite.apply(writeFunction, argsArray);
    logBuffer.write.apply(logBuffer, argsArray);
  };
};

module.exports = CollectLogsHook;
