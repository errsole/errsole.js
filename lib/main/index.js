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
};

Main.customLogger = function (level, message) {
  Logs.customLogger(level, message);
};

Main.customLoggerAlert = function (level, message) {
  Alerts.customLoggerAlert(level, message);
};

module.exports = Main;
