'use strict'
const FS = require('fs');
const PATH = require('path');

function readDirSync (path) {
  var directoryData = {};
  try {
    directoryData = FS.readdirSync(path);
  } catch(e) {
    var errorMessage = e.message || 'Failed to read the folder';
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
        'name': fileName,
        'url': path+'/'+fileName,
        'type': type,
        'id': randomId()
      })
    }
    return data;
  } else {
    return result;
  }
}

function checkStat(path) {
  var stats;
  var lstat;
  try {
    stats = FS.statSync(path);
    lstat = FS.lstatSync(path);
  }
  catch (e) { return null }

  if (lstat.isSymbolicLink()) {
    return 'symbolicLink';
  } else if (stats.isFile()) {
    return 'file';
  } else if (stats.isDirectory()) {
    return 'directory';
  } else {
    return 'file';
  }
}

function randomId() {
  return Math.floor(Math.random()*1000000);
}

module.exports = getDirectory;
