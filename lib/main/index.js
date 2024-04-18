'use strict';

const Logs = require('./logs');
const ExpressApp = require('./server');

const Main = {};

Main.initialize = function (options) {
  const port = parseInt(options.port) || 8001;
  Logs.initialize(options);
  const enableDashboard = typeof options.enableDashboard === 'boolean' ? options.enableDashboard : true;
  if (enableDashboard) {
    ExpressApp.addStorage(options);
    ExpressApp.addPath(options);
    ExpressApp.listen(port, () => {
      console.log('(✓) Errsole with built-in dashboard is running on ' + port);
    });
  } else {
    console.log('(×) Errsole built-in dashboard is disabled at initialization');
  }
};

module.exports = Main;
