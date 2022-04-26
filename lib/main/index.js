'use strict'

var Hook = require('./hooks');
var EventCapture = require('./eventCapture');
var ForksManager = require('./forksManager');
var Server = require('./connection/server');
var appConfig = require('../config');
var pjson = require('../../package.json');

var Main = {};

Main.initialize = function(options) {
  var token = options.token;
  var pkgVersion = pjson.version || '';
  if(!token || token == '') {
    throw new Error('App token is missing in the initialize function arguments. For more information, visit our documentation page at https://errsole.com/documentation');
  }

  Hook.initialize();
  EventCapture.initialize();

  process.nextTick(function() {
    ForksManager.initialize();
    appConfig.setVersion(pkgVersion);
    appConfig.setOptions(options);
    Server.initialize(token);
  })
}

Main.wrapPort = function(port) {
  appConfig.addWrappedPorts(port);
  return port;
}


module.exports = Main;
