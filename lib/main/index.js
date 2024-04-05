'use strict';

const Logs = require('./logs');
const ExpressApp = require('./server');

const Main = {};

Main.initialize = function (options) {
  const port = parseInt(options.port) || 8001;
  Logs.initialize(options);
  ExpressApp.addStorage(options);
  ExpressApp.addPath(options);
  ExpressApp.listen(port, () => {
    console.log('Errsole with built-in dashboard is running on ' + port);
  });
};

module.exports = Main;
