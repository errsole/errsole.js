'use strict';

const Hapi = require('@hapi/hapi');
const errsole = require('errsole');
const ErrsoleSQLite = require('errsole-sqlite');

// Insert the Errsole code snippet at the beginning of your app's main file
errsole.initialize({
  storage: new ErrsoleSQLite('/tmp/logs.sqlite')
});

const init = async () => {
  const server = Hapi.server({
    port: 3000,
    host: 'localhost'
  });

  // Register the Errsole Proxy Middleware at the desired path (e.g., /errsole)
  // Make sure this is the first plugin to be registered
  await server.register({
    plugin: errsole.hapiProxyMiddleware('/errsole')
  });

  // Register other plugin below the Errsole Proxy Middleware

  await server.start();
  console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {
  console.log(err);
  process.exit(1);
});

init();
