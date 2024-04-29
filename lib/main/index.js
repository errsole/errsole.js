'use strict';

const Logs = require('./logs');
const ExpressApp = require('./server');
const Alerts = require('./server/utils/alerts');

const Main = {};

Main.initialize = function (options) {
  const port = parseInt(options.port) || 8001;
  Logs.initialize(options);
  const enableDashboard = typeof options.enableDashboard === 'boolean' ? options.enableDashboard : true;
  const exitOnException = typeof options.exitOnException === 'boolean' ? options.exitOnException : true;
  if (enableDashboard) {
    ExpressApp.addStorage(options);
    ExpressApp.addPath(options);
    ExpressApp.listen(port, () => {
      const basePath = options.path || '';
      console.log('Errsole Dashboard is accessible at http://localhost:' + port + basePath);
    });
  } else {
    console.log('Errsole Dashboard is disabled: You have disabled the Errsole Dashboard in the Errsole module configuration.');
  }
  handleUncaughtExceptions(exitOnException);
};

Main.customLogger = async function (level, message, metadata) {
  Logs.customLogger(level, message, metadata);
  if (level === 'alert') {
    await Alerts.customLoggerAlert(message);
  }
};

async function handleUncaughtExceptions (exitOnException) {
  process.on('uncaughtException', async function (err, origin) {
    const errorOrigin = 'Origin: ' + origin;
    const errorMessage = err.stack || err.message;
    console.error(`${errorOrigin}\n${errorMessage}`);
    await Alerts.handleUncaughtExceptions(errorOrigin + '\n' + errorMessage);
    if (exitOnException) process.exit(1);
  });
}

module.exports = Main;
