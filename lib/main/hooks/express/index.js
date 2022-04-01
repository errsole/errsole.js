'use strict'

const FS = require('fs');
const Path = require('path');
const { v4: uuidv4 } = require('uuid');

var Events = require('../../eventCapture/events');
var appConfig = require('../../../config');

var pendingHTTPRequests = appConfig.getPendingHTTPRequests()

var ExpressHook = {};

function wrapExpress(_express) {
  var express = function createApplication() {
    var app = _express();
    app.use(errsoleWatcher);
    app.use(errsoleResponseCapture);
    app.listen = wraplisten(app.listen, app);
    process.nextTick(function() {
      app.use(errsoleErrorHandler);
    });
    return app;
  };
  Object.setPrototypeOf(express, _express);
  return express;
}

function wraplisten(_listen, app) {
  return function () {
    var port = arguments[0];
    appConfig.addMainProcessPort(port);
    appConfig.addWrappedPorts(port);
    return _listen.call(app, ...arguments);
  }
}

function wrapExpressSession(_session) {
  var session = function session(options) {
    var _middleware = _session(options);
    return function session(req, res, next) {
      _middleware(req, res, function(arg) {
        if (req.sessionID) {
          req.errsole.session = {
            sid: req.sessionID,
            session: req.session
          };
        }
        next(arg);
      });
    };
  };
  Object.setPrototypeOf(session, _session);
  return session;
}

function errsoleErrorHandler(err, req, res, next) {
  req.errsole.error = err;
  next(err);
}

function errsoleWatcher(req, res, next) {
  req.errsole = {};
  req.errsole.id = uuidv4();
  Events.emit(Events.ADD_HTTP_REQUEST_LOG, req);

  var reqStartTime = process.hrtime.bigint();

  var errsoleSessionId = getErrsoleSessonId(req);
  if(!errsoleSessionId) {
    var errsoleSessionId = uuidv4();
    res = setErrsoleSessionId(res, errsoleSessionId)
  }

  var afterResponse = function() {
    req.errsole.responseTime = ((process.hrtime.bigint() - reqStartTime)/1000000n).toString();
    req.errsole.errsoleSessionId = errsoleSessionId;
    Events.emit(Events.REMOVE_HTTP_REQUEST_LOG, req);
    Events.emit(Events.HTTP_RESPONSE_SENT, {
      request: req,
      response: res
    });
  };

  if(res._events) {
    if(res._events.finish) {
      res.on('finish', afterResponse);
    } else if(res._events.close) {
      res.on('close', afterResponse);
    } else {
      throw new Error('unable to attach error watcher');
    }
  } else {
    throw new Error('unable to attach error watcher');
  }
  next();
}

function errsoleResponseCapture(req, res, next) {
  req.errsole.responseBody = '';
  var _resWrite = res.write;
  res.write = function write(chunk, encoding, callback) {
    if (!chunk) {
      req.errsole.responseBody += '';
    } else if (Buffer.isBuffer(chunk)) {
      req.errsole.responseBody += chunk.toString(encoding);
    } else if (typeof chunk === 'string') {
      req.errsole.responseBody += chunk;
    } else {
      req.errsole.responseBody = 'Response not available';
    }
    _resWrite.call(res, chunk, encoding, callback);
  };
  if (parseInt(process.versions.node) >= 8) {
    var _resEnd = res.end;
    res.end = function end(chunk, encoding) {
      if (!chunk) {
        req.errsole.responseBody += '';
      } else if (Buffer.isBuffer(chunk)) {
        req.errsole.responseBody += chunk.toString(encoding);
      } else if (typeof chunk === 'string') {
        req.errsole.responseBody += chunk;
      } else {
        req.errsole.responseBody = 'Response not available';
      }
      _resEnd.call(res, chunk, encoding);
    };
  }
  next();
};

function getErrsoleSessonId(req) {
  try {
    if(req.headers.cookie) {
      var sessionName = appConfig.getSessionName();
      var errsoleSessionId = get_cookies(req)[sessionName];
      if(errsoleSessionId) {
        return errsoleSessionId;
      }
    } else {
      return null;
    }
  } catch(e) {
    console.error(e);
    return null;
  }
}

function setErrsoleSessionId(res, errsoleSessionId) {
  try {
    var sessionName = appConfig.getSessionName();
    res.cookie(sessionName, errsoleSessionId)
  } catch(e) {
    console.error(e);
  }
  return res;
}

function get_cookies(request) {
  var cookies = {};
  request.headers && request.headers.cookie.split(';').forEach(function(cookie) {
    var parts = cookie.match(/(.*?)=(.*)$/)
    cookies[ parts[1].trim() ] = (parts[2] || '').trim();
  });
  return cookies;
}


ExpressHook.packages = [{
    name: 'express',
    wrapper: wrapExpress
  }, {
    name: 'express-session',
    wrapper: wrapExpressSession
  }
];

module.exports = ExpressHook;
