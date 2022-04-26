'use strict'

var Net = require('net');
var Fork = require('../../fork/fork');
var Events = require('../eventCapture/events');
var Server = require('../connection/server');
var appConfig = require('../../config');
var activeForks = require('./activeForks');

var MINIMUM_PORT = 50000;
var MAXIMUM_PORT = 60000;

var ForksManager= {};

ForksManager.initialize = function() {
  var self = this;
  var mainProcessPort = appConfig.getMainProcessPort();
  var wrappedPorts = appConfig.getWrappedPorts();
  Events.on(Events.ROUTER_CONNECTION_ESTABLISHED, function() {
    Server.register(Server.START_DEBUGGER_URI, function(args, kwargs, details) {
      var enableDebugger = appConfig.getEnableDebugger();
      if(!enableDebugger) {
        return {
          'error': 'debugger is not enabled',
          'reason': 'debugger_disabled'
        }
      }
      checkOrphanForkProcess();
      var appProcessId = appConfig.getAppProcessId();
      var debuggerSessionId = kwargs.debuggerSessionId || null;
      if(!debuggerSessionId) {
        return {
          'error': 'debugger session id is missing',
          'reason': 'debugger_session_id'
        }
      }
      var fork = null;
      if (activeForks.hasFork[debuggerSessionId]) {
        return {
          'error': 'debugger session id is duplicate',
          'reason': 'debugger_session_id_duplicate'
        }
      }
      return getPorts(wrappedPorts.length + 1).then(async function(ports) {
        var forkOptions = {};
        forkOptions.mainProcessPort = mainProcessPort;
        forkOptions.debugPort = ports.pop();
        forkOptions.ports = {};
        forkOptions.debuggerSessionId = debuggerSessionId;
        for(var index in wrappedPorts) {
          var port = wrappedPorts[index];
          forkOptions.ports[port] = ports.pop();
        }
        fork = new Fork(forkOptions);
        try {
          var isForkProcessStarted = await fork.start();
          return isForkProcessStarted;
        } catch (e) {
          console.error(e);
        }
      }).then(function(isForkProcessStarted) {
        if(isForkProcessStarted == true) {
          activeForks.addFork(debuggerSessionId, fork);
          return {
            'appProcessId': appProcessId
          };
        } else {
          return {
            'error': 'Unable to start debugger',
            'reason': 'child_process_failed'
          };
        }
      })
      .catch(function(e) {
        activeForks.removeFork(debuggerSessionId);
        return {
          'error': 'Unable to start debugger',
          'reason': ''
        };
      });
    }, {
      invoke: appConfig.getInvokeType()
    });
  });
};

function getPorts(num) {
  return new Promise(function(resolve, reject) {
    var promises = [];
    for (var index = 0; index < num; index++) {
      promises.push(reservePort());
    }
    Promise.all(promises).then(function(dummyServers) {
      var ports = [];
      for (var index = 0; index < dummyServers.length; index++) {
        ports.push(dummyServers[index].address().port);
        dummyServers[index].close();
      }
      resolve(ports);
    }).catch(function(e) {
      reject('failed to get ports');
    });
  });
};

function reservePort() {
  return new Promise(function(resolve, reject) {
    var server = Net.createServer();
    var retries = 0;
    var maxRetries = 5;
    server.listen(Math.floor(Math.random() * (MAXIMUM_PORT - MINIMUM_PORT + 1)) + MINIMUM_PORT);
    server.once('listening', function(err) {
      resolve(server);
    });
    server.on('error', function(err) {
      if (retries < maxRetries) {
        retries++;
        server.listen(Math.floor(Math.random() * (MAXIMUM_PORT - MINIMUM_PORT + 1)) + MINIMUM_PORT);
      } else {
        reject('get port for child: max retries exceeded');
      }
    });
  });
};

function checkOrphanForkProcess() {
  var allActiveForks = activeForks.allActiveForks;
  for(var key in allActiveForks) {
    var debuggerSessionId = key;
    Server.call('com.errsole.web.debugger_session.'+debuggerSessionId+'.ping', [], {})
    .then(function(result) {
      if(result !== 'pong') {
        if(allActiveForks[key]._forkedProcess.kill) {
          allActiveForks[key]._forkedProcess.kill('SIGINT');
        }
        activeForks.removeFork(debuggerSessionId);
      }
    })
    .catch(function(e) {
      if(allActiveForks[key]._forkedProcess.kill) {
        allActiveForks[key]._forkedProcess.kill('SIGINT');
      }
      activeForks.removeFork(debuggerSessionId);
    });
  }
}


module.exports = ForksManager;
