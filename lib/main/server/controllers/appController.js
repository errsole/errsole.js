const Jsonapi = require('../utils/jsonapiUtil');
const NPMUpdates = require('../utils/npmUpdates');
const { getStorageConnection } = require('../storageConnection');
const packageJson = require('../../../../package.json');

exports.checkUpdates = async (req, res) => {
  try {
    const errsoleLatestVersion = await NPMUpdates.fetchLatestVersion('errsole');
    const storageConnection = getStorageConnection();
    const storageLatestVersion = await NPMUpdates.fetchLatestVersion(storageConnection.name);
    const data = {
      name: packageJson.name,
      version: packageJson.version,
      latest_version: errsoleLatestVersion,
      storage_name: storageConnection.name,
      storage_version: storageConnection.version,
      storage_latest_version: storageLatestVersion
    };
    res.send(Jsonapi.Serializer.serialize(Jsonapi.AppType, data));
  } catch (error) {
    console.error(error);
    res.status(500).send({
      errors: [{
        error: 'Internal Server Error',
        message: 'An unexpected error occurred'
      }]
    });
  }
};
