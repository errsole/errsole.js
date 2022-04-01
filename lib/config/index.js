'use strict';

const slash = require('slash');

var appConfig = {
  "sessionAPIServer"          : "api.errsole.com",
  "routerURL"                 : "wss://router.errsole.com/ws",
  "domain"                    : "https://www.errsole.com",
  'routerRealm'               : "errsole-realm",
  "appToken"                  : null,
  "frameworkName"             : "express",
  "appProcessId"              : null,
  "appId"                     : null,
  "statusCodes"               : [],
  "mainDirectory"             : null,
  "mainProcessPort"           : null,
  "wrappedPorts"              : [],
  "invokeType"                : "roundrobin",
  "nodeFrameworkKeys"         : {},
  "sessionName"               : "errsole.sid",
  "pendingHTTPRequests"       : {},
  "logFileRoundTime"          : 5,
  "logFileTTL"                : 30
}


module.exports = {
  addMainProcessPort: function(port) {
    appConfig.mainProcessPort = port;
  },
  getMainProcessPort: function() {
    return appConfig.mainProcessPort;
  },
  addWrappedPorts: function(port) {
    appConfig.wrappedPorts.push(port);
  },
  getWrappedPorts: function() {
    return appConfig.wrappedPorts;
  },
  getAppToken: function() {
    return appConfig.appToken;
  },
  setAppToken: function(appToken) {
    appConfig.appToken = appToken;
  },
  setAppProcessId: function(appProcessId) {
    appConfig.appProcessId = appProcessId;
  },
  setAppId: function(appId) {
    appConfig.appId = appId;
  },
  setStatusCodes: function(statusCodes) {
    appConfig.statusCodes = statusCodes;
  },
  setMainDirectory: function(value) {
    appConfig.mainDirectory = slash(value);
  },
  getSessionAPIServer: function() {
    return appConfig.sessionAPIServer;
  },
  getSessionAPIServerPort: function() {
    return appConfig.sessionAPIServerPort;
  },
  getAppProcessId: function() {
    return appConfig.appProcessId;
  },
  getAppId: function() {
    return appConfig.appId;
  },
  getMainDirectory: function() {
    return appConfig.mainDirectory;
  },
  getRouterUrl: function() {
    return appConfig.routerURL;
  },
  getRouterRealm: function() {
    return appConfig.routerRealm;
  },
  getInvokeType: function() {
    return appConfig.invokeType;
  },
  getFrameworkName: function() {
    return appConfig.frameworkName;
  },
  setNodeFrameworkKeys: function(frameworkName, frameworkkeys) {
    appConfig.nodeFrameworkKeys[frameworkName] = frameworkkeys;
  },
  getDomain: function() {
    return appConfig.domain;
  },
  getSessionName: function() {
    return appConfig.sessionName;
  },
  sessionStore: null,
  getPendingHTTPRequests: function() {
    return appConfig.pendingHTTPRequests;
  },
  getLogFileRoundTime: function() {
    return appConfig.logFileRoundTime;
  },
  getLogFileTTL: function() {
    return appConfig.logFileTTL;
  }
};
