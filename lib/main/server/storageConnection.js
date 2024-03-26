let storageConnection = null;

function initializeStorageConnection (storage) {
  if (!storageConnection) {
    storageConnection = storage;
  }
  return storageConnection;
}

function getStorageConnection () {
  if (!storageConnection) {
    throw new Error('Storage connection has not been initialized.');
  }
  return storageConnection;
}

module.exports = { initializeStorageConnection, getStorageConnection };
