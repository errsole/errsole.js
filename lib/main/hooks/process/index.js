'use strict'

var Events = require('../../eventCapture/events');
var appConfig = require('../../../config');
var pendingHTTPRequests = appConfig.getPendingHTTPRequests();

var ProcessHook = {};

ProcessHook.initialize = function() {
  handleUncaughtExceptions();
}

ProcessHook.exitProcess = function(code = 1) {
  process.exit(code);
}

function handleUncaughtExceptions() {
  process.on('uncaughtException', function(err) {
    console.error(err);
    var logData = Object.assign({}, pendingHTTPRequests);
    logData = Object.keys(logData).map((key) => logData[key]);
    var payload = {
      error: err,
      logData: logData
    };
    Events.emit(Events.UNCAUGHT_EXCEPTION, payload);
  });
}

ProcessHook.packages = [];

module.exports = ProcessHook;
