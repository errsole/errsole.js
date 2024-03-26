const Jsonapi = require('../utils/jsonapiUtil');
const { getStorageConnection } = require('../storageConnection');

exports.getLogs = async (req, res) => {
  const query = req.query || {};
  const storageConnection = getStorageConnection();
  const logs = await storageConnection.getLogs(query);
  res.send(Jsonapi.Serializer.serialize(Jsonapi.UserType, logs));
};
