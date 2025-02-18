const stream = require('stream');
const stripAnsi = require('strip-ansi');
const os = require('os');
const pid = process.pid;

const LogLevel = {
  INFO: 'info',
  ERROR: 'error'
};

const logCollector = {
  storage: {},
  collectLogs: [LogLevel.INFO, LogLevel.ERROR],
  enableConsoleOutput: process.env.NODE_ENV !== 'production',
  hostname: os.hostname(),
  pid,
  isInitializationFailed: false,
  isStorageReady: false,
  originalStdoutWrite: process.stdout.write,
  originalStderrWrite: process.stderr.write,

  setInitializationTimeout () {
    this.initializationTimeoutId = setTimeout(() => {
      this.createEmptyLogStream();
      this.isInitializationFailed = true;
      console.error('Error: Unable to initialize Errsole');
    }, 30000);
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
        this.isStorageReady = true;
      });
    }

    if (this.enableConsoleOutput) {
      process.stdout.write = this.originalStdoutWrite;
      process.stderr.write = this.originalStderrWrite;
    } else {
      console.log('Note: Terminal output will be disabled after initial logs.');
      process.stdout.write = (chunk, encoding, done) => done();
      process.stderr.write = (chunk, encoding, done) => done();
    }
    if (this.collectLogs.includes(LogLevel.INFO)) {
      this.interceptLogs(LogLevel.INFO);
      console.log(`Errsole is capturing ${LogLevel.INFO.toUpperCase()} logs.`);
    } else {
      console.log(`Errsole is NOT capturing ${LogLevel.INFO.toUpperCase()} logs.`);
    }
    if (this.collectLogs.includes(LogLevel.ERROR)) {
      this.interceptLogs(LogLevel.ERROR);
      console.log(`Errsole is capturing ${LogLevel.ERROR.toUpperCase()} logs.`);
    } else {
      console.log(`Errsole is NOT capturing ${LogLevel.ERROR.toUpperCase()} logs.`);
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
      case LogLevel.INFO:
        logStream = process.stdout;
        originalWrite = this.originalStdoutWrite;
        break;
      case LogLevel.ERROR:
        logStream = process.stderr;
        originalWrite = this.originalStderrWrite;
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

      if (this.enableConsoleOutput || !this.isStorageReady) {
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

  logCustomMessage (level, message, metadata, errsoleId, timestamp) {
    const logEntry = {
      timestamp: timestamp || new Date().toISOString(),
      message,
      meta: metadata || '{}',
      source: 'errsole',
      level,
      hostname: this.hostname,
      pid: this.pid,
      errsole_id: errsoleId
    };
    try {
      this.logStream.write(logEntry);
      if(!this.enableConsoleOutput) {
        return;
      }
      this.originalStdoutWrite.call(process.stdout, `${message}\n`, 'utf8');
    } catch (err) {
      console.error(err);
    }
  }
};

logCollector.resetConsoleOutput = function() {
  this.logStream.uncork();
  if(!this.enableConsoleOutput) {
    this.enableConsoleOutput = true;
    process.stdout.write = this.originalStdoutWrite;
    process.stderr.write = this.originalStderrWrite;
  }
}

logCollector.setInitializationTimeout();
logCollector.createLogStream();
logCollector.logStream.cork();
logCollector.interceptLogs(LogLevel.INFO);
logCollector.interceptLogs(LogLevel.ERROR);

module.exports = logCollector;
