const stream = require('stream');
const stripAnsi = require('strip-ansi');
const os = require('os');
const pid = process.pid;

const LogLevel = {
  ERROR: 'error',
  INFO: 'info'
};

const logCollector = {
  storage: {},
  collectLogs: [LogLevel.INFO, LogLevel.ERROR],
  enableConsoleOutput: process.env.NODE_ENV !== 'production',
  hostname: os.hostname(),
  pid,
  isInitializationFailed: false,
  originalStderrWrite: process.stderr.write,
  originalStdoutWrite: process.stdout.write,

  setInitializationTimeout () {
    this.initializationTimeoutId = setTimeout(() => {
      this.createEmptyLogStream();
      this.isInitializationFailed = true;
      console.error('Error: Unable to initialize Errsole');
    }, 10000);
  },

  initialize (options = {}) {
    this.storage = options.storage;
    this.collectLogs = options.collectLogs || [LogLevel.INFO, LogLevel.ERROR];
    if (typeof options.enableConsoleOutput !== 'undefined') {
      this.enableConsoleOutput = options.enableConsoleOutput;
    }
    this.hostname = options.serverName || os.hostname();

    if (this.storage.once) {
      this.storage.once('ready', () => {
        clearTimeout(this.initializationTimeoutId);
        if (this.isInitializationFailed) {
          this.createLogStream();
          this.isInitializationFailed = false;
        } else {
          this.logStream.uncork();
        }
      });
    }
    process.stderr.write = this.originalStderrWrite;
    process.stdout.write = this.originalStdoutWrite;
    if (this.collectLogs.includes(LogLevel.ERROR)) {
      console.log(`Errsole is capturing ${LogLevel.ERROR.toUpperCase()} logs.`);
      this.interceptLogs(LogLevel.ERROR);
    } else {
      console.log(`Errsole is NOT capturing ${LogLevel.ERROR.toUpperCase()} logs.`);
    }
    if (this.collectLogs.includes(LogLevel.INFO)) {
      console.log(`Errsole is capturing ${LogLevel.INFO.toUpperCase()} logs.`);
      this.interceptLogs(LogLevel.INFO);
    } else {
      console.log(`Errsole is NOT capturing ${LogLevel.INFO.toUpperCase()} logs.`);
    }
  },

  createLogStream () {
    this.logStream = new stream.Writable({
      objectMode: true,
      write: (logEntry, encoding, callback) => {
        this.storage.postLogs([logEntry]);
        setImmediate(callback);
      }
    });
  },

  createEmptyLogStream () {
    if (this.logStream) {
      this.logStream.destroy();
    }
    this.logStream = new stream.Writable({
      objectMode: true,
      write: (logEntry, encoding, callback) => {
        setImmediate(callback);
      }
    });
  },

  interceptLogs (level) {
    let logStream;
    let originalWrite;
    switch (level) {
      case LogLevel.ERROR:
        logStream = process.stderr;
        originalWrite = this.originalStderrWrite;
        break;
      case LogLevel.INFO:
        logStream = process.stdout;
        originalWrite = this.originalStdoutWrite;
        break;
      default:
        return;
    }

    logStream.write = (chunk, encoding, done) => {
      const cleanedChunk = stripAnsi(chunk.toString());
      const logEntry = {
        timestamp: new Date().toISOString(),
        message: cleanedChunk,
        source: 'console',
        level,
        hostname: this.hostname,
        pid: this.pid
      };
      this.logStream.write(logEntry);

      if (this.enableConsoleOutput) {
        originalWrite.call(logStream, chunk, encoding, done);
      } else if (done) {
        done();
      }
    };
  },

  async flushLogs (timeout = 5000) {
    if (typeof this.storage.flushLogs === 'function') {
      try {
        await Promise.race([
          this.storage.flushLogs(),
          new Promise((resolve, reject) => setTimeout(() => reject(new Error('flushLogs timed out')), timeout))
        ]);
      } catch (err) {
        console.error(err);
      }
    }
  },

  logCustomMessage (level, message, metadata) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      message,
      meta: metadata || '{}',
      source: 'errsole',
      level,
      hostname: this.hostname,
      pid: this.pid
    };
    try {
      this.logStream.write(logEntry);
    } catch (err) {
      console.error(err);
    }
  }
};

logCollector.setInitializationTimeout();
logCollector.createLogStream();
logCollector.logStream.cork();
logCollector.interceptLogs(LogLevel.ERROR);
logCollector.interceptLogs(LogLevel.INFO);

module.exports = logCollector;
