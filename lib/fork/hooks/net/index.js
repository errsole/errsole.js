var NetHook = {};

function wrapNetServerListen(_net) {
  if (typeof _net.Server === 'function') {
    var originalServerObject = new _net.Server()
    _net.Server = function () {
      this.listen = function () {
        var args = [].slice.call(arguments)
        if(process.env.ERRSOLE_PORTS) {
          var portsMap = JSON.parse(process.env.ERRSOLE_PORTS);
          if (args[0] && typeof args[0] === 'object' && !isNaN(args[0].port)) {
            var port = args[0].port;
            if(portsMap[port.toString()]) {
              args[0].port = portsMap[port.toString()];
            }
          } else if (!isNaN(args[0])) {
            var port = args[0]
            if(portsMap[port.toString()]) {
              args[0] = portsMap[port.toString()];
            }
          }
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
