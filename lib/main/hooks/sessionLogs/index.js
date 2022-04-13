'use strict'
const FS = require('fs');
const Path = require('path');
const { v4: uuidv4 } = require('uuid');
var cron = require('node-cron');
var Server = require('../../connection/server');
var Events = require('../../eventCapture/events');
var appConfig = require('../../../config');

var SessionLogs = {};

SessionLogs.initialize = function() {
  Events.on(Events.ROUTER_CONNECTION_ESTABLISHED, function() {
    Server.register(Server.GET_SESSION_LOG_DATA, async function(args, kwargs) {
      var errsoleSessionId = kwargs.errsoleSessionId;
      if(!errsoleSessionId) {
        return null;
      }
      try {
        var sessionLogData = await getSessionLogData(errsoleSessionId);
        return sessionLogData;
      } catch(e){
        console.error(e);
        return null;
      }
    }, {
      invoke: appConfig.getInvokeType()
    });
  });
  tmpFolderHandler();
  clearSessionLogData();
}

function getSessionLogData(errsoleSessionId) {
  return new Promise(function(resolve, reject) {
    var folderPath = Path.resolve(__dirname, '../tmp');
    var filePath1 = folderPath+'/'+errsoleSessionId+'_'+getRoundTime(1);
    var filePath2 = folderPath+'/'+errsoleSessionId+'_'+getRoundTime(2);
    var filePath3 = folderPath+'/'+errsoleSessionId+'_'+getRoundTime(3);
    var logData = [];

    // read 1st file
    try {
      var logs = FS.readFileSync(filePath1, {encoding:'utf8', flag:'r'});
      logs = '['+logs.slice(0, -1)+']';
      logs = JSON.parse(logs);
      logData = logData.concat(logs);
      if(logData.length >= 20) {
        logData.sort((a,b) => (b.datetime > a.datetime) ? 1 : ((a.datetime > b.datetime) ? -1 : 0));
        logData = logData.slice(0, 20);
        resolve(logData);
      }
    } catch(e) {}
    // read 2nd file
    try {
      var logs = FS.readFileSync(filePath2, {encoding:'utf8', flag:'r'});
      logs = '['+logs.slice(0, -1)+']';
      logs = JSON.parse(logs);
      logData = logData.concat(logs);
      if(logData.length >= 20) {
        logData.sort((a,b) => (b.datetime > a.datetime) ? 1 : ((a.datetime > b.datetime) ? -1 : 0));
        logData = logData.slice(0, 20);
        resolve(logData);
      }
    } catch(e) {}
    // read 3rd file
    try {
      var logs = FS.readFileSync(filePath3, {encoding:'utf8', flag:'r'});
      logs = '['+logs.slice(0, -1)+']';
      logs = JSON.parse(logs);
      logData = logData.concat(logs);
      if(logData.length >= 20) {
        logData.sort((a,b) => (b.datetime > a.datetime) ? 1 : ((a.datetime > b.datetime) ? -1 : 0));
        logData = logData.slice(0, 20);
        resolve(logData);
      }
    } catch(e) {}
    logData.sort((a,b) => (b.datetime > a.datetime) ? 1 : ((a.datetime > b.datetime) ? -1 : 0));
    logData = logData.slice(0, 20);
    resolve(logData);
  });
}


SessionLogs.addHTTPResponseLog = function(errsoleSessionId, type, data) {
  try {
    var message = '';
    if(data.error && data.error.message) {
      message = data.error.message
    } else if(data.response && data.response.statusMessage) {
      message = data.response.statusMessage
    }
    var log = {
      id: uuidv4(),
      datetime: new Date().getTime(),
      type: type,
      method: data.request.method,
      path: data.request.path,
      routePath: data.request.routePath,
      statusCode: data.response.statusCode,
      message: message,
      data: data
    }
    addSessionLog(errsoleSessionId, log)
  } catch(e) {
    console.error(e);
  }
}

var tmpFolderHandler = function() {
  var folderPath = Path.resolve(__dirname, '../tmp');
  if (!FS.existsSync(folderPath)) {
    FS.mkdirSync(folderPath);
  }
}

var addSessionLog = function(errsoleSessionId, data) {
  var folderPath = Path.resolve(__dirname, '../tmp');
  if (!FS.existsSync(folderPath)) {
    return false;
  }
  var filePath = folderPath+'/'+errsoleSessionId+'_'+getRoundTime();
  try {
    var writer = FS.createWriteStream(filePath, {flags:'a'})
    writer.write(JSON.stringify(data)+',');
    writer.end();
  } catch(e) {
    console.error(e);
  }
}

var clearSessionLogData = function() {
  var folderPath = Path.resolve(__dirname, '../tmp');
  if (!FS.existsSync(folderPath)) {
    return false;
  }
  try {
    var fileList = FS.readdirSync(folderPath);
    for(var key in fileList) {
      var fileName = fileList[key];
      var filePath = folderPath+'/'+fileName;
      var status = isFileExpired(filePath);
      if(status) {
        FS.unlinkSync(filePath)
      }
    }
  } catch(e){
    console.error(e);
  }
}

var isFileExpired = function(filePath) {
  try {
    const stats = FS.statSync(filePath);
    var timeDiff = new Date() - new Date(stats.mtime);
    var minutes = Math.floor(timeDiff / 60000);
    var logFileTTL = appConfig.getLogFileTTL()
    if(minutes >= logFileTTL) {
      return true;
    } else {
      return false;
    }
  } catch(e){
    console.error(e);
  }
}

var getRoundTime = function(i = 1) {
  var logFileRoundTime = appConfig.getLogFileRoundTime();
  var coeff = 1000 * 60 * logFileRoundTime;
  var currentTime = new Date().getTime();
  var roundedTime = Math.round(currentTime / coeff) * coeff;
  var roundedTime = roundedTime - coeff*i;
  return roundedTime;
}

cron.schedule('10 * * * *', () => {
  clearSessionLogData();
});



SessionLogs.initialize();

module.exports = SessionLogs;
