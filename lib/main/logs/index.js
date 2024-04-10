const stream = require('stream');
const stripAnsi = require('strip-ansi');
const ipaddress = require('../utils/ipaddress');
const localIP = ipaddress.getLocalIP();

const LogLevel = {
  INFO: 'info',
  ERROR: 'error'
};

const CollectLogsHook = {
  storage: {},
  collectLogs: [],
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
  }
  if (this.collectLogs.includes(LogLevel.ERROR)) {
    this.captureLogs(LogLevel.ERROR);
  }
};

CollectLogsHook.captureLogs = function (level) {
  const self = this;
  const logBuffer = new stream.Writable();
  logBuffer._write = (chunk, encoding, done) => {
    const cleanedChunk = stripAnsi(chunk.toString());
    const logEntry = { message: cleanedChunk, level, timestamp: new Date().toISOString(), private_ip: localIP || '', source: 'console' };
    try { self.storage.postLogs([logEntry]); } catch (err) { }
    done();
  };

  const originalWrite = level === LogLevel.INFO ? process.stdout.write : process.stderr.write;
  const writeFunction = level === LogLevel.INFO ? process.stdout : process.stderr;

  writeFunction.write = function () {
    const argsArray = Array.from(arguments);
    if (self.enableConsoleOutput || !this.storage.isConnected) {
      originalWrite.apply(writeFunction, argsArray);
    }
    logBuffer.write.apply(logBuffer, argsArray);
  };
};

module.exports = CollectLogsHook;
