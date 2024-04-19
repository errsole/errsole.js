const express = require('express');
const path = require('path');
const apiRoutes = require('./routes/apiRoutes');
const { initializeStorageConnection } = require('./storageConnection');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.addStorage = function (options) {
  initializeStorageConnection(options.storage);
};

app.addPath = function (options) {
  const basePath = options.path || '/';
  app.use(basePath, apiRoutes);
  let filePath = basePath;
  if (!filePath.endsWith('/')) {
    filePath += '/';
  }
  app.use(filePath + 'dist', express.static(path.join(__dirname, '..', '..', 'web', 'dist')));
  app.use(filePath + 'assets', express.static(path.join(__dirname, '..', '..', 'web', 'assets')));
};

module.exports = app;
