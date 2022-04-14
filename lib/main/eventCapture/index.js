'use strict'

var Events = require('./events');
var Server = require('../connection/server');
var ProcessHook = require('../hooks/process');
var SessionLogs = require('../hooks/sessionLogs');
var jp = require('jsonpath');
const { v4: uuidv4 } = require('uuid');
var appConfig = require('../../config');
var pendingHTTPRequests = appConfig.getPendingHTTPRequests()

var EventCapturer = {};

var DataExtractionSchema = {};
var CaptureCriteria = {};

EventCapturer.initialize = function() {
  Events.on(Events.UNCAUGHT_EXCEPTION, uncaughtExceptionHandler);
  Events.on(Events.ADD_HTTP_REQUEST_LOG, addHttpRequestLogHandler);
  Events.on(Events.REMOVE_HTTP_REQUEST_LOG, removeHttpRequestLogHandler);
  Events.on(Events.HTTP_RESPONSE_SENT, httpResponseHandler);
  Events.on(Events.ROUTER_CONNECTION_ESTABLISHED, getEventCaptureCriteria);
}

function uncaughtExceptionHandler(payload) {
  if(!payload || !payload.error) {
    return false;
  }
  var data = {
    error: {
      code: payload.error.code,
      message: payload.error.message,
      stack: payload.error.stack
    },
    logData: payload.logData
  }
  Server.call(Server.UNCAUGHT_EXCEPTION_HANDLER_URI, [], data)
  .then(function() {
    ProcessHook.exitProcess(1);
  })
  .catch(function(e) {
    ProcessHook.exitProcess(1);
  });
}


function addHttpRequestLogHandler(request) {
  if(!request) {
    return false;
  }
  var reqId = request.errsole.id;
  getServerSchema()
  .then(function(keysSchema) {
    if(!keysSchema) {
      return false;
    }
    var data = {
      'request': request
    }
    var requestData = extractData(data, keysSchema.requestKeys, keysSchema.deleteKeys);
    var sessionData = extractData(data, keysSchema.sessionKeys, keysSchema.deleteKeys);
    if(requestData) {
      try {
        var log = {
          id: uuidv4(),
          timestamp: new Date().getTime(),
          type: 'uncaught',
          path: requestData.path,
          routePath: requestData.routePath,
          method: requestData.method,
          data: {
            request: requestData,
            session: sessionData
          }
        }
        pendingHTTPRequests[reqId] = log;
      } catch(e) {
        console.error(e);
      }
    }
  });
}

function removeHttpRequestLogHandler(request) {
  if(!request) {
    return false;
  }
  var reqId = request.errsole.id;
  if(reqId) {
    delete pendingHTTPRequests[reqId];
  }
}


function httpResponseHandler(payload) {
  if(!payload) {
    return false;
  }
  getServerSchema()
  .then(function(keysSchema) {
    if(!keysSchema) {
      return false;
    }
    var requestData = extractData(payload, keysSchema.requestKeys, keysSchema.deleteKeys);
    var responseData = extractData(payload, keysSchema.responseKeys, keysSchema.deleteKeys);
    var sessionData = extractData(payload, keysSchema.sessionKeys, keysSchema.deleteKeys);
    var errorData = extractData(payload, keysSchema.errorKeys, keysSchema.deleteKeys);
    var matchedCriteria = matchCriteria(requestData, responseData);
    var data = {
      request: requestData,
      response: responseData,
      session: sessionData,
      error: errorData
    };
    if (matchedCriteria.length) {
      matchedCriteria.forEach(function(criteria) {
        if (criteria.isHTTPException) {
          Server.call(Server.HTTP_EXCEPTION_URI, [], data).catch(console.log);
        }
        if (criteria.isRouteFlagged) {
          Server.call(Server.HTTP_FLAGGED_INVOCATION_URI, [], data).catch(console.log);
        }
        var errsoleSessionId = payload.request.errsole.errsoleSessionId;
        SessionLogs.addHTTPResponseLog(errsoleSessionId, 'http', data);
      });
    } else {
      var errsoleSessionId = payload.request.errsole.errsoleSessionId;
      SessionLogs.addHTTPResponseLog(errsoleSessionId, 'http', data);
    }
  });
}

function matchCriteria(requestData, responseData) {
  var matches = [];
  if (CaptureCriteria.statusCodes.indexOf(responseData.statusCode) >= 0) {
    matches.push({
      isHTTPException: true
    });
  }
  CaptureCriteria.routes.forEach(function(route) {
    if (requestData.routingPath === route.path && requestData.method === route.method) {
      matches.push({
        isRouteFlagged: true
      });
    }
  });
  return matches;
}

function extractData(data, keyMap, deleteKeys) {
  var eventData = Object.assign({}, data);
  var data = {};

  if(typeof keyMap !== 'object' || typeof deleteKeys !== 'object') {
    return null;
  }

  try {
    for(var key in deleteKeys) {
      var keyData = deleteKeys[key];
      jp.apply(eventData, keyData, function(v) { return null; });
    }
  } catch(e) { console.error(e); }

  try {
    for(var key in keyMap) {
      var keyData = keyMap[key];
      var temp = jp.value(eventData, keyData);
      if(!temp) {
        temp = null;
      } else {
        data[key] = temp;
      }
    }
  } catch(e) { console.error(e); }

  return data;
}

function getEventCaptureCriteria() {
  Server.call(Server.GET_EVENT_CAPTURE_CRITERIA_URI)
  .then(function(result) {
    Object.assign(CaptureCriteria, result);
    Server.subscribe(Server.EVENT_CAPTURE_CRITERIA_UPDATED_URI, function(args, kwargs) {
      Object.assign(CaptureCriteria, kwargs);
    });
    setInterval(function(){ updateEventCaptureCriteria(); }, 1000*60*2);
    getServerSchema();
  })
  .catch(function(err) {
    console.error(err);
  });
}

function updateEventCaptureCriteria() {
  Server.call(Server.GET_EVENT_CAPTURE_CRITERIA_URI)
  .then(function(result) {
    Object.assign(CaptureCriteria, result);
  })
  .catch(function(err) {
    console.error(err);
  });
}

function getServerSchema() {
  var frameworkName = appConfig.getFrameworkName();
  if (DataExtractionSchema[frameworkName]) {
    return Promise.resolve(DataExtractionSchema[frameworkName]);
  }
  var data = {
    'frameworkName': frameworkName,
    'frameworkVersion': '',
    'nodeVersion': process.versions.node
  }
  return Server.call(Server.NODE_FRAMEWORK_KEYS, [], data)
  .then(function(result) {
    if(Object.keys(result).length == 0) {
      console.error(new Error('Errsole Internal Error: Failed to get the framework schema. Please report the issue at https://github.com/errsole/errsole/issues'));
    } else {
      appConfig.setNodeFrameworkKeys(frameworkName, result);
      DataExtractionSchema[frameworkName] = result;

      return result;
    }
  }).catch(function(err) {
    console.error(new Error('Errsole Internal Error: '+(err.message || err.toString())+'. Please report the issue at https://github.com/errsole/errsole/issues'));
  });
}

module.exports = EventCapturer;
