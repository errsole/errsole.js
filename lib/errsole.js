'use strict'

var Errsole = {};

Errsole.initialize = function() {
  console.log("**************************************** \n The Errsole v1 package is now available under the new name '@errsole/node'. You can find it at: https://www.npmjs.com/package/@errsole/node \n ****************************************");
}

Errsole.setup = function() {

}

Errsole.wrapPort = function(port) {
  return port;
}

module.exports = Errsole;
