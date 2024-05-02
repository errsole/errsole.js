'use strict';

const { createProxyMiddleware } = require('http-proxy-middleware');
const ErrsoleMain = require('./main');
const Errsole = {};
let port;
let basePath;

Errsole.initialize = function (options) {
  if (!options) {
    throw new Error('Initialization failed');
  }
  if (!options.storage) {
    throw new Error('Initialization failed: "storage" property is missing.');
  }
  port = parseInt(options.port) || 8001;
  basePath = options.path || '';
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
  if (basePath === '') {
    throw new Error('Please remove the path from the Errsole initialization to use the Errsole proxy middleware.');
  } else {
    return createProxyMiddleware({
      target: 'http://localhost:' + port,
      changeOrigin: true,
      pathRewrite: (path, req) => {
        return path.replace(/^\/errsole/, '');
      }
    });
  }
};

module.exports = Errsole;
