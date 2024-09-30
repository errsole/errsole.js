'use strict';
const ErrsoleMain = require('./main');
const { createProxyMiddleware, fixRequestBody } = require('http-proxy-middleware');
const koaProxies = require('koa-proxies');
const h2o2 = require('@hapi/h2o2');
const util = require('util');
const http = require('http');
const { URL } = require('url');

const Errsole = {
  port: 8001
};

function sanitizePath (basePath, reqPath) {
  const sanitizedUrl = new URL(reqPath, `http://${basePath}`);
  return sanitizedUrl.pathname;
}

Errsole.initialize = function (options = {}) {
  if (!options.storage) {
    throw new Error('Initialization failed: "storage" property is missing.');
  }
  this.port = parseInt(options.port, 10) || 8001;
  ErrsoleMain.initialize(options);
};

function createLogger (level) {
  return function (...args) {
    let message;

    if (args.length === 1) {
      const arg = args[0];
      try {
        if (typeof arg === 'string' || typeof arg === 'number' || typeof arg === 'boolean' || arg === null || arg === undefined || typeof arg === 'symbol' || typeof arg === 'function') {
          message = arg.toString();
        } else {
          message = util.inspect(arg, { depth: null });
        }
      } catch (err) {
        message = String(arg);
      }
    } else {
      message = args.map(arg => {
        try {
          if (typeof arg === 'string' || typeof arg === 'number' || typeof arg === 'boolean' || arg === null || arg === undefined || typeof arg === 'symbol' || typeof arg === 'function') {
            return arg.toString();
          } else {
            return util.inspect(arg, { depth: null });
          }
        } catch (err) {
          return String(arg);
        }
      }).join(' ');
    }

    if (this.metadata != null) {
      let metadataString;
      if (typeof this.metadata === 'object') {
        try {
          metadataString = JSON.stringify(this.metadata, null, 2);
        } catch (e) {
          metadataString = String(this.metadata);
        }
      } else {
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

Errsole.proxyMiddleware = () => () => {};

Errsole.multiFrameworkProxyMiddleware = function () {
  return createProxyMiddleware({
    target: 'http://localhost:' + this.port,
    changeOrigin: true,
    on: {
      proxyReq: fixRequestBody
    }
  });
};

Errsole.expressProxyMiddleware = function () { return Errsole.multiFrameworkProxyMiddleware(); };
Errsole.httpProxyMiddleware = function () { return Errsole.multiFrameworkProxyMiddleware(); };
Errsole.connectProxyMiddleware = function () { return Errsole.multiFrameworkProxyMiddleware(); };
Errsole.fastifyProxyMiddleware = function () { return Errsole.multiFrameworkProxyMiddleware(); };
Errsole.koaProxyMiddleware = function (url) {
  return koaProxies(url, {
    target: 'http://localhost:' + this.port,
    changeOrigin: true,
    rewrite: (path) => {
      const newPath = path.replace(url, '');
      return newPath;
    }
  });
};

Errsole.nestExpressProxyMiddleware = function (path, req, res, next) {
  const sanitizedPath = sanitizePath('localhost:' + this.port, req.url.replace(path, ''));
  const options = {
    hostname: 'localhost',
    port: this.port,
    path: sanitizedPath,
    method: req.method,
    headers: {
      ...req.headers,
      host: 'localhost:' + this.port
    }
  };

  const proxyReq = http.request(options, (proxyRes) => {
    if (proxyRes.statusCode && proxyRes.headers) {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
    }
    proxyRes.pipe(res, { end: true });
  });

  req.pipe(proxyReq, { end: true });
};

Errsole.nestFastifyProxyMiddleware = function (path, req, res) {
  const sanitizedPath = sanitizePath('localhost:' + this.port, req.url.replace(path, ''));

  const options = {
    hostname: 'localhost',
    port: this.port,
    path: sanitizedPath,
    method: req.method,
    headers: {
      ...req.headers,
      host: 'localhost:' + this.port
    }
  };

  const proxyReq = http.request(options, (proxyRes) => {
    if (proxyRes.statusCode && proxyRes.headers) {
      res.raw.writeHead(proxyRes.statusCode, proxyRes.headers);
    }
    proxyRes.pipe(res.raw, { end: true });
  });

  req.raw.pipe(proxyReq, { end: true });
};

Errsole.hapiProxyMiddleware = function (basePath, auth = false) {
  const targetURL = 'http://localhost:' + this.port;
  return {
    name: 'hapiProxyMiddleware',
    register: async function (server, options) {
      await server.register(h2o2);

      server.route({
        method: '*',
        path: `${basePath}/{path*}`,
        handler: {
          proxy: {
            mapUri: (request) => {
              const pathSuffix = request.params.path ? '/' + request.params.path : '';
              const queryString = request.url.search || '';
              return { uri: `${targetURL}${pathSuffix}${queryString}` };
            },
            passThrough: true,
            xforward: true
          }
        },
        options: {
          auth
        }
      });
    }
  };
};
module.exports = Errsole;
module.exports.default = Errsole;
