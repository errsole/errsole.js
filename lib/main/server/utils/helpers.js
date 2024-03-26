const { v4: uuidv4 } = require('uuid');
const { getStorageConnection } = require('../storageConnection');
let JWT_SECRET;

exports.extractAttributes = (data) => {
  if (data && data.data && data.data.attributes) {
    return data.data.attributes;
  } else {
    return {};
  }
};

exports.addJWTSecret = async () => {
  const storageConnection = getStorageConnection();
  const jwtSecret = await storageConnection.getConfig('jwtSecret');
  if (jwtSecret) {
    JWT_SECRET = jwtSecret;
  } else {
    const jwtSecret = uuidv4();
    const result = await storageConnection.setConfig('jwtSecret', jwtSecret);
    if (result && result.status) {
      JWT_SECRET = jwtSecret;
    }
  }
  if (JWT_SECRET) {
    return JWT_SECRET;
  } else {
    return false;
  }
};

exports.getJWTSecret = () => {
  if (JWT_SECRET) {
    return JWT_SECRET;
  } else {
    return false;
  }
};
