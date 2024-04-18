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
  let capturingAnyLogs = false;
  if (this.collectLogs.includes(LogLevel.INFO)) {
    this.captureLogs(LogLevel.INFO);
    console.log('(✓) INFO level logs are now being monitored.');
    capturingAnyLogs = true;
  }
  if (this.collectLogs.includes(LogLevel.ERROR)) {
    this.captureLogs(LogLevel.ERROR);
    console.log('(✓) ERROR level logs are now being monitored.');
    capturingAnyLogs = true;
  }
  if (!capturingAnyLogs) {
    console.log('(×) No logs will be captured.');
  }
};

CollectLogsHook.captureLogs = function (level) {
  const self = this;
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
    if (self.enableConsoleOutput) {
      originalWrite.apply(writeFunction, argsArray);
    }
    logBuffer.write.apply(logBuffer, argsArray);
  };
};

module.exports = CollectLogsHook;
