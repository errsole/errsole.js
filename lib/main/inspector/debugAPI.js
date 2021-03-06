'use strict';

var appConfig = require('../../config');
var activeForks = require('../forksManager/activeForks');
var Server = require('../connection/server');
var getDirectory = require('./directory');

function DebugAPI(connection, debuggerSessionId, forkedProcess) {
  var self = this;
  this._connection = connection;
  this._forkedProcess = forkedProcess;
  this._dict = {};
  this._mainDirectory = appConfig.getMainDirectory();
  this._debuggerSessionId = debuggerSessionId;
  this._connection.send('Debugger.enable');
  this._connection.send('Runtime.enable');
  this.scriptParsed();
  this.initialize();
  // attach process exit event
  this._forkedProcess.on('exit', (code) => {
    var debuggerSessionId = self._debuggerSessionId;
    activeForks.removeFork(debuggerSessionId);
    try {
      Server.call('com.errsole.web.debugger_session.'+debuggerSessionId+'.stop_debugger', [], {}).catch(console.log);
    } catch(e) {
      return e;
    }
  });
}


DebugAPI.prototype.scriptParsed = function () {
  var self = this;
  this._dict['scriptParsed'] = [];
  this._connection.on('Debugger.scriptParsed', function(data) {
    if(data) {
      self._dict['scriptParsed'].push(data);
    }
  });
}

DebugAPI.prototype.initialize = function () {
  var self = this;
  try {
    this._connection.on('Debugger.paused', function(data) {
      var debuggerSessionId = self._debuggerSessionId;
      Server.publish('com.errsole.module.debugger_session.'+debuggerSessionId+'.paused', [], data);
    });
  } catch(e) {
    return e;
  }

  try {
    this._connection.on('Debugger.resumed', function(data) {
      var debuggerSessionId = self._debuggerSessionId;
      Server.publish('com.errsole.module.debugger_session.'+debuggerSessionId+'.resumed', [], data);
    });
  } catch(e) {
    return e;
  }

  try {
    this._connection.on('Runtime.consoleAPICalled', function(data) {
      var debuggerSessionId = self._debuggerSessionId;
      Server.publish('com.errsole.module.debugger_session.'+debuggerSessionId+'.console_api_called', [], data);
    });
  } catch(e) {
    return e;
  }
}

/* Inspector APIs */

DebugAPI.prototype.getScriptParsed = async function (args, kwargs, details) {
  var count = kwargs.count || 0;
  var totalScriptsParsed = this._dict['scriptParsed'].length;
  if(totalScriptsParsed > count) {
    var data = {
      'mainDirectory': this._mainDirectory,
      'scripts': this._dict['scriptParsed'],
      'count': this._dict['scriptParsed'].length
    }
  } else {
    var data = {
      'mainDirectory': this._mainDirectory,
      'scripts': [],
      'count': this._dict['scriptParsed'].length
    }
  }
  return data;
}

DebugAPI.prototype.getScriptSource = async function (args, kwargs, details) {
  var data = {
    'scriptId': kwargs.scriptId || 0
  }
  try {
    var result = await this._connection.send('Debugger.getScriptSource', data);
    return result;
  } catch(e) {
    return e;
  }
}

DebugAPI.prototype.updateScriptSource = async function (args, kwargs, details) {
  var self = this;
  var editCode = appConfig.getEditCode();
  if(!editCode) {
    return {
      'error': 'Code editing is disabled in your Errsole module configuration. Please visit our GitHub page for configuration instructions.',
      'reason': 'edit_code_disabled'
    }
  }
  var data = {
    'scriptId': kwargs.scriptId || 0,
    'scriptSource': kwargs.scriptSource || '',
    'dryRun': false
  };
  try {
    var result = await this._connection.send('Debugger.setScriptSource', data);
    return result;
  } catch(e) {
    return e;
  }
}

DebugAPI.prototype.setBreakpoint = async function (args, kwargs, details) {
  var data = {
    'location': kwargs.location
  };
  try {
    var result = await this._connection.send('Debugger.setBreakpoint', data);
    return result;
  } catch (e) {
    return {
      'error': 'unable to add breakpoint at this location'
    }
  }
}

DebugAPI.prototype.removeBreakpoint = async function (args, kwargs, details) {
  var data = {
    'breakpointId': kwargs.breakpointId
  };
  try {
    var result = await this._connection.send('Debugger.removeBreakpoint', data);
    return result;
  } catch(e) {
    return e;
  }
}

DebugAPI.prototype.stopModuleDebugger = async function (args, kwargs, details) {
  this._forkedProcess.kill('SIGINT');
  return true;
}

DebugAPI.prototype.postRequest = async function (args, kwargs, details) {
  var fork = activeForks.getFork(this._debuggerSessionId);
  try {
    await this._connection.send('Debugger.setSkipAllPauses', {skip: false});
    var result = await fork.Http.postRequestsListener(kwargs, this._debuggerSessionId);
    return result;
  } catch(e) {
    return e;
  }
}

DebugAPI.prototype.cancelRequest = async function (args, kwargs, details) {
  var fork = activeForks.getFork(this._debuggerSessionId);
  try {
    var result = await fork.Http.cancelRequest(kwargs, this._debuggerSessionId);
    if(result) {
      await this._connection.send('Debugger.setSkipAllPauses', {skip: true});
      await this._connection.send('Debugger.resume', {terminateOnResume: false});
      return true;
    } else {
      return false;
    }
  } catch(e) {
    return e;
  }
}

DebugAPI.prototype.resumeExecution = async function (args, kwargs, details) {
  try {
    var result = await this._connection.send('Debugger.resume');
    return result;
  } catch(e) {
    return e;
  }
}

DebugAPI.prototype.stepOver = async function (args, kwargs, details) {
  try {
    var result = await this._connection.send('Debugger.stepOver');
    return result;
  } catch(e) {
    return e;
  }
}

DebugAPI.prototype.stepInto = async function (args, kwargs, details) {
  try {
    var result = await this._connection.send('Debugger.stepInto');
    return result;
  } catch(e) {
    return e;
  }
}

DebugAPI.prototype.stepOut = async function (args, kwargs, details) {
  try {
    var result = await this._connection.send('Debugger.stepOut');
    return result;
  } catch(e) {
    return e;
  }
}

DebugAPI.prototype.getProperties = async function (args, kwargs, details) {
  var data = {
    'objectId': kwargs.objectId
  };
  try {
    var result = await this._connection.send('Runtime.getProperties', data);
    return result;
  } catch(e) {
    return e;
  }
}

DebugAPI.prototype.RuntimeConsoleEvaluate = async function (args, kwargs, details) {
  var evalExpression = appConfig.getEvalExpression();
  if(!evalExpression) {
    return {
      'error': 'JavaScript expression evaluation is disabled in your Errsole module configuration. Please visit our GitHub page for configuration instructions.',
      'reason': 'eval_expression_disabled'
    }
  }
  var data = {
    'expression': kwargs.expression,
    'callFrameId': kwargs.callFrameId,
    'includeCommandLineAPI': true,
    'returnByValue': false
  };
  try {
    if(!data.callFrameId) {
      var result = await this._connection.send('Runtime.evaluate', data);
    } else {
      var result = await this._connection.send('Debugger.evaluateOnCallFrame', data);
    }
    return result;
  } catch(e) {
    return e;
  }
}

DebugAPI.prototype.RuntimeWatchExpressionEvaluate = async function (args, kwargs, details) {
  var evalExpression = appConfig.getEvalExpression();
  if(!evalExpression) {
    return {
      'error': 'JavaScript expression evaluation is disabled in your Errsole module configuration. Please visit our GitHub page for configuration instructions.',
      'reason': 'eval_expression_disabled'
    }
  }
  var data = {
    'expression': kwargs.expression,
    'callFrameId': kwargs.callFrameId,
    'includeCommandLineAPI': false,
    'returnByValue': false
  };
  try {
    if(!data.callFrameId) {
      var result = await this._connection.send('Runtime.evaluate', data);
    } else {
      var result = await this._connection.send('Debugger.evaluateOnCallFrame', data);
    }
    return result;
  } catch(e) {
    return e;
  }
}

DebugAPI.prototype.GetDirectory = async function (args, kwargs, details) {
  var data = {
    'path': kwargs.path
  };
  try {
    if(data.path) {
      var result = getDirectory(data.path);
    } else {
      return null;
    }
    return result;
  } catch(e) {
    return e;
  }
}

module.exports = DebugAPI;
