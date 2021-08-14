var appConfig = require('../../../config');

var NetHook = {};

function wrapNetServerListen(_net) {
  if (typeof _net.Server === 'function') {
    var originalServerObject = new _net.Server()
    _net.Server = function () {
      this.listen = function () {
        var args = [].slice.call(arguments)
        if (args[0] && typeof args[0] === 'object' && !isNaN(args[0].port)) {
          var port = args[0].port;
          appConfig.addWrappedPorts(port);
        } else if (!isNaN(args[0])) {
          var port = args[0]
          appConfig.addWrappedPorts(port);
        }
        return originalServerObject.listen.apply(this, args)
      }
    }
    _net.Server.prototype = originalServerObject
  }
  return _net;
}


NetHook.packages = [{
    name: 'net',
    wrapper: wrapNetServerListen
  }
];

module.exports = NetHook;
