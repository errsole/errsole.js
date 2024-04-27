'use strict';

const ErrsoleMain = require('./main');
const Errsole = {};

Errsole.initialize = function (options) {
  if (!options && !options.storage) {
    throw new Error('option issue');
  }
  ErrsoleMain.initialize(options);
};

function createLogger (level) {
  return function (...args) {
    const message = handleArgs(args);
    ErrsoleMain.customLogger(level, message);
    return {
      alert: function () {
        ErrsoleMain.customLoggerAlert(level, message);
      }
    };
  };
}

function handleArgs (args) {
  const cache = new WeakSet();
  try {
    const stringArgs = args.map(arg => {
      if (typeof arg === 'object') {
        try {
          return JSON.stringify(arg, (key, value) => {
            if (typeof value === 'object' && value !== null) {
              if (value instanceof ArrayBuffer || ArrayBuffer.isView(value)) {
                return Array.from(new Uint8Array(value.buffer));
              }
              if (cache.has(value)) {
                return;
              }
              cache.add(value);
            }
            return value;
          }, 2);
        } catch (error) {
          return 'Error in serialization: ' + error.message;
        }
      } else {
        return String(arg);
      }
    });
    const result = stringArgs.join('\n');
    return result;
  } catch (err) {
    return 'Error processing arguments: ' + err.message;
  }
}

Errsole.error = createLogger('error');
Errsole.warn = createLogger('warn');
Errsole.debug = createLogger('debug');
Errsole.info = createLogger('info');

module.exports = Errsole;
