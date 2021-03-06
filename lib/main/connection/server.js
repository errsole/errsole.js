'use strict'

var Autobahn = require('@errsole/autobahn');
var Https = require('https');
var Os = require('os');
var Path = require('path');
var terminalLink = require('terminal-link');
var appConfig = require('../../config');

var Events = require('../eventCapture/events');

var Server = {};

var invokeType = {
  invoke: appConfig.getInvokeType()
};

Server.initialize = function (appToken) {
  Server.registerProcess(appToken)
  .then(function(result) {
    appConfig.setAppProcessId(result.processId);
    appConfig.setAppId(result.appId);
    return Server.connectToRouter(result);
  })
  .catch(function(err) {
    console.error(err);
  });
}

Server.registerProcess = function(appToken) {
  var registrationPayload = {
  	data: {
  		type: 'processes',
  		attributes: {
  			appToken: appToken,
  			details: {
  				pid: process.pid,
          mainDirectory: Path.dirname(require.main.filename),
  				nodeVersion: process.versions.node,
          errsoleVersion: appConfig.getVersion(),
  				v8Version: process.versions.v8,
  				osPlatform: process.platform,
  				processorArchitecture: process.arch,
          totalMemory: Os.totalmem(),
          freeMemory: Os.freemem()
  			}
  		}
  	}
  };
  return new Promise(function(resolve, reject) {
    var hostname = appConfig.getSessionAPIServer();
    var port = appConfig.getSessionAPIServerPort();
    var mainDirectory = appConfig.setMainDirectory(Path.dirname(require.main.filename));
    var options = {
      "hostname": hostname,
      "path": '/apps/processes',
      "method": 'POST'
    };
    var req = Https.request(options, function(response) {
      var body;
      response.on('data', function(d) {
        if (body) {
          body += d;
        } else {
          body = d;
        }
      });
      response.on('end', function() {
        try {
          var payload = JSON.parse(body.toString());
          if(payload.errors) {
            if(payload.errors[0]) {
              reject(new Error('Errsole Internal Error: '+payload.errors[0].detail+'.'));
            }
          }
          var result = {
            processId: payload.data.attributes.processId,
            appId: payload.data.attributes.appId,
            appEnvironmentId: payload.data.attributes.appEnvironmentId,
            sessionToken: payload.data.attributes.token
          };
          resolve(result);
        } catch (err) {
          reject(new Error('Errsole Internal Error: '+(err.message || err.toString())+'. Please report the issue at https://github.com/errsole/errsole/issues'));
        }
      });
    });

    req.on('error', function(err) {
      /* server connection reinitialize */
      if(err) {
        reinitialize();
      }
      reject(new Error('Errsole Internal Error: '+(err.message || err.toString())+'. Please report the issue at https://github.com/errsole/errsole/issues'));
    });

    req.write(JSON.stringify(registrationPayload));
    req.end();
  });
};


Server.connectToRouter = function(appProcessData) {
  initializeConstants(appProcessData.appId, appProcessData.processId, appProcessData.appEnvironmentId);
  var sessionToken = appProcessData.sessionToken;
  var routerURL = appConfig.getRouterUrl();
  var routerRealm = appConfig.getRouterRealm();
  var Connection = new Autobahn.Connection({
    url: routerURL,
    realm: routerRealm,
    authmethods: ['ticket'],
    authid: 'module',
    max_retries: -1,
    onchallenge: function(session, method, extra) {
      return sessionToken;
    }
  });

  Connection.onopen = function (session, details) {
    var appId = appConfig.getAppId();
    var domain = appConfig.getDomain();
    var link = terminalLink(domain+'/#/apps/'+appId+'/errors', domain+'/#/apps/'+appId+'/errors');
    console.log('Errsole setup is complete. You can view your app errors at '+link);
    Events.emit(Events.ROUTER_CONNECTION_ESTABLISHED);
  };

  Connection.onclose = function (reason, details) {
    console.error(new Error('Errsole Internal Error: '+(details.message || reason)+'. Please report the issue at https://github.com/errsole/errsole/issues'));
    /* server connection reinitialize */
    if(!details.will_retry) {
      reinitialize();
    }
  };

  Connection.open();
  Server.Connection = Connection;
};

function reinitialize() {
  console.log('errsole auto-reinitialize in '+ 300+'s ..');
  var appToken = appConfig.getAppToken();
  setTimeout(function() {
    Server.initialize(appToken);
  }, 300*1000);
}

function initializeConstants(appId, processId, appEnvironmentId) {
  Server.APP_ID = appId;
  Server.PROCESS_ID = processId;
  Server.ENV_ID = appEnvironmentId;

  /* call methods */
  Server.UNCAUGHT_EXCEPTION_HANDLER_URI = 'com.errsole.api.capture_uncaught_exception';
  Server.HTTP_EXCEPTION_URI = 'com.errsole.api.capture_http_error';
  Server.HTTP_FLAGGED_INVOCATION_URI = 'com.errsole.api.capture_flagged_http_request';
  Server.NODE_FRAMEWORK_KEYS = 'com.errsole.api.get_framework_schema_v2';
  Server.GET_EVENT_CAPTURE_CRITERIA_URI = 'com.errsole.api.get_http_request_capture_criteria';
  Server.EVENT_CAPTURE_CRITERIA_UPDATED_URI = 'com.errsole.api.apps.'+ Server.APP_ID+ '.environments.' + Server.ENV_ID + '.http_request_capture_criteria_updated';
  Server.START_DEBUGGER_URI = 'com.errsole.module.apps.' + Server.APP_ID + '.environments.' + Server.ENV_ID + '.start_debugger';
  Server.GET_SESSION_LOG_DATA = 'com.errsole.module.apps.' + Server.APP_ID + '.environments.' + Server.ENV_ID +'.processes.'+ Server.PROCESS_ID+'.get_log_data';
}


Server.call = function(uri, args, kwargs) {
  return new Promise(function(resolve, reject) {
    if (!Server.Connection || !Server.Connection.isOpen) {
        reject(new Error('Errsole Internal Error: Failed to call the URI "'+uri+'". Errsole connection is not ready. Please report the issue at https://github.com/errsole/errsole/issues'));
    }
    try {
      Server.Connection.session.call(uri, args, kwargs)
      .then(function(result) {
        resolve(result)
      })
      .catch(function(error) {
        reject(error)
      })
    } catch (e) {
      reject(new Error('Errsole Internal Error: '+(e.message || e.toString())+'. Please report the issue at https://github.com/errsole/errsole/issues'));
    }
  })
};


Server.publish = function(uri, args, kwargs) {
  if (!Server.Connection || !Server.Connection.isOpen) {
    console.error(new Error('Errsole Internal Error: Failed to publish on the URI "'+uri+'". Errsole connection is not ready. Please report the issue at https://github.com/errsole/errsole/issues '));
  }
  try {
    return Server.Connection.session.publish(uri, args, kwargs);
  } catch (e) {
    console.error(new Error('Errsole Internal Error: '+(e.message || e.toString())+'. Please report the issue at https://github.com/errsole/errsole/issues'));
  }
};

Server.subscribe = function(uri, handler) {
  if (!Server.Connection || !Server.Connection.isOpen) {
    console.error(new Error('Errsole Internal Error: Failed to subscribe to the URI "'+uri+'". Errsole connection is not ready. Please report the issue at https://github.com/errsole/errsole/issues '));
  }
  try {
    return Server.Connection.session.subscribe(uri, handler);
  } catch (e) {
    console.error(new Error('Errsole Internal Error: '+(e.message || e.toString())+'. Please report the issue at https://github.com/errsole/errsole/issues'));
  }
};

Server.register = function(uri, handler, invokeType) {
  if (!Server.Connection || !Server.Connection.isOpen) {
    console.error(new Error('Errsole Internal Error: Failed to register the URI "'+uri+'". Errsole connection is not ready. Please report the issue at https://github.com/errsole/errsole/issues'));
  }
  try {
    Server.Connection.session.register(uri, handler, invokeType)
    .then(
     function (registration) {},
     function (e) {
       console.error(new Error('Errsole Internal Error: '+(e.error || e.toString())+'. Please report the issue at https://github.com/errsole/errsole/issues'));
     }
    );
  } catch (e) {
    console.error(new Error('Errsole Internal Error: '+(e.message || e.toString())+'. Please report the issue at https://github.com/errsole/errsole/issues'));
  }
};


module.exports = Server;
