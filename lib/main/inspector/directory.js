'use strict'
const FS = require('fs');
const PATH = require('path');
const { v4: uuidv4 } = require('uuid');

function readDirSync (path) {
  var directoryData = {};
  try {
    directoryData = FS.readdirSync(path);
  } catch(e) {
    var errorMessage = e.message || 'Failed to read the directory';
    var error =  {
      'error': errorMessage
    }
    return error;
  }
  return directoryData;
}


function getDirectory (path) {
  var result = readDirSync(path);
  if(!result.error) {
    var data = [];
    for(var key in result) {
      var fileName = result[key];
      var type = checkStat(PATH.join(path, fileName)) || 'file';
      data.push({
        'id': randomId(),
        'name': fileName,
        'path': PATH.resolve(path, fileName),
        'type': type
      })
    }
    return data;
  } else {
    return result;
  }
}

function checkStat(path) {
  var stats;
  try {
    stats = FS.statSync(path);
  }
  catch (e) { return null }

  if (stats.isFile()) {
    return 'file';
  } else if (stats.isDirectory()) {
    return 'dir';
  } else {
    return 'file';
  }
}

function randomId() {
  return uuidv4();
}

module.exports = getDirectory;
