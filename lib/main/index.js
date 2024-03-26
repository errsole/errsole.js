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
    console.log('running on 8001');
  });
};

module.exports = Main;
