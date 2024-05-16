/*
 * ─────────────────────────────────────────────────────────────────────
 *                          ERRSOLE DASHBOARD SETUP
 * ─────────────────────────────────────────────────────────────────────
 * The Errsole Web Dashboard will be accessible at:
 * http://localhost:3000/errsole/logs/dashboard
 *
 * Here's how the complete path is constructed:
 * ─────────────────────────────────────────────────────────────────────
 * Middleware base path:           '/errsole'
 * Custom path in initialization:  '/logs/dashboard'
 * ─────────────────────────────────────────────────────────────────────
 */
'use strict';

const Hapi = require('@hapi/hapi');
const errsole = require('errsole');
const ErrsoleSequelize = require('errsole-sequelize');

// Initialize Errsole with a custom path
errsole.initialize({
  storage: new ErrsoleSequelize({
    dialect: 'sqlite',
    storage: '/tmp/logs.sqlite'
  }),
  path: '/logs/dashboard' // Custom path
});

const init = async () => {
  const server = Hapi.server({
    port: 3000,
    host: 'localhost'
  });

  // Register Errsole Proxy Middleware
  await server.register({
    plugin: errsole.hapiProxyMiddleware('/errsole')
  });

  await server.start();
  console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {
  console.log(err);
  process.exit(1);
});

init();
