'use strict';

const Logs = require('./logs');
const ExpressApp = require('./server');
const Alerts = require('./server/utils/alerts');

const Main = {};

Main.initialize = function (options) {
  const port = parseInt(options.port) || 8001;
  Logs.initialize(options);
  const enableDashboard = typeof options.enableDashboard === 'boolean' ? options.enableDashboard : true;
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
  handleUncaughtExceptions();
};

Main.customLogger = async function (level, message, metadata) {
  Logs.customLogger(level, message, metadata);
  if (level === 'alert') {
    await Alerts.customLoggerAlert(message);
  }
};

async function handleUncaughtExceptions () {
  process.on('uncaughtException', async function (err, origin) {
    const errorMessage = `Uncaught Exception: ${err.message}\nOrigin: ${origin}`;
    const errorStack = `Stack Trace:\n${err.stack}`;
    console.error(`${errorMessage}\n${errorStack}`);
    await Alerts.handleUncaughtExceptions(`${errorMessage}\n${errorStack}`);
    process.exit(1);
  });
}

module.exports = Main;
