'use strict';

const { createProxyMiddleware, fixRequestBody } = require('http-proxy-middleware');
const koaProxies = require('koa-proxies');
const h2o2 = require('@hapi/h2o2');
const util = require('util');
const http = require('http');
const ErrsoleMain = require('./main');
const Errsole = {
  port: 8001
};

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

    if (this.metadata && (typeof this.metadata === 'object' || Array.isArray(this.metadata)) && this.metadata !== null) {
      let metadataString;
      try {
        metadataString = JSON.stringify(this.metadata, null, 2);
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
  const options = {
    hostname: 'localhost',
    port: this.port,
    path: req.url.replace(path, ''),
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

  proxyReq.on('error', (err) => {
    res.status(500).send('Proxy request error' + err);
  });

  if (req.method === 'POST' && req.body) {
    const bodyData = JSON.stringify(req.body);
    proxyReq.setHeader('Content-Type', 'application/json');
    proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
    proxyReq.write(bodyData);
  }

  proxyReq.end();
};

Errsole.nestFastifyProxyMiddleware = function (path, req, res) {
  const bodyChunks = [];
  req.raw.on('data', chunk => {
    bodyChunks.push(chunk);
  });

  req.raw.on('end', () => {
    const bodyData = Buffer.concat(bodyChunks).toString();
    const options = {
      hostname: 'localhost',
      port: this.port,
      path: req.url.replace(path, ''),
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

    proxyReq.on('error', (err) => {
      res.status(500).send('Proxy request error: ' + err);
    });

    if (req.method === 'POST' && bodyData) {
      proxyReq.setHeader('Content-Type', 'application/json');
      proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
      proxyReq.write(bodyData);
    }
    proxyReq.end();
  });
};

Errsole.hapiProxyMiddleware = function (basePath) {
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
        }
      });
    }
  };
};
module.exports = Errsole;
