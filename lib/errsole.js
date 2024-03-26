'use strict';

const ErrsoleMain = require('./main');
const Errsole = {};

Errsole.initialize = function (options) {
  if (!options && !options.storage) {
    throw new Error('option issue');
  }
  ErrsoleMain.initialize(options);
};

module.exports = Errsole;
