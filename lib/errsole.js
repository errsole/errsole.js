'use strict';

const { createProxyMiddleware } = require('http-proxy-middleware');
const ErrsoleMain = require('./main');
const Errsole = {
  port: 8001,
  path: null
};

Errsole.initialize = function (options = {}) {
  if (!options.storage) {
    throw new Error('Initialization failed: "storage" property is missing.');
  }
  this.port = parseInt(options.port, 10) || 8001;
  this.path = options.path || null;
  ErrsoleMain.initialize(options);
};

function createLogger (level) {
  return function (...args) {
    const message = args.map(arg => {
      try {
        return typeof arg === 'object' ? JSON.stringify(arg) : arg.toString();
      } catch (e) {
        return String(arg);
      }
    }).join(' ');
    if (this.metadata && (typeof this.metadata === 'object' || Array.isArray(this.metadata)) && this.metadata !== null) {
      let metadataString;
      try {
        metadataString = JSON.stringify(this.metadata);
      } catch (e) {
        metadataString = String(this.metadata);
      }
      ErrsoleMain.customLogger(level, message, metadataString);
    } else {
      ErrsoleMain.customLogger(level, message);
    }
  };
}

Errsole.meta = function (data) {
  const loggerContext = {
    metadata: data,
    alert: createLogger('alert').bind({ metadata: data }),
    error: createLogger('error').bind({ metadata: data }),
    warn: createLogger('warn').bind({ metadata: data }),
    debug: createLogger('debug').bind({ metadata: data }),
    info: createLogger('info').bind({ metadata: data }),
    log: createLogger('info').bind({ metadata: data })
  };
  return loggerContext;
};

Errsole.alert = createLogger('alert').bind({ metadata: {} });
Errsole.error = createLogger('error').bind({ metadata: {} });
Errsole.warn = createLogger('warn').bind({ metadata: {} });
Errsole.debug = createLogger('debug').bind({ metadata: {} });
Errsole.info = createLogger('info').bind({ metadata: {} });
Errsole.log = createLogger('info').bind({ metadata: {} });

Errsole.proxyMiddleware = function () {
  if (!this.path || this.path === '') {
    throw new Error('Invalid path. Path is mandatory with errsole proxyMiddleware.');
  } else if (typeof this.path !== 'string' || !this.path.trim() || this.path.trim() === '/') {
    throw new Error('Invalid path. Path must be like "/mypath" or "/mypath/logs".');
  } else {
    return createProxyMiddleware({
      target: 'http://localhost:' + this.port,
      changeOrigin: true,
      pathFilter: this.path
    });
  }
};

module.exports = Errsole;
