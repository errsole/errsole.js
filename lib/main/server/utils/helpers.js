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
  try {
    const storageConnection = getStorageConnection();
    const data = await storageConnection.getConfig('jwtSecret');
    if (data && data.item && data.item.key === 'jwtSecret') {
      JWT_SECRET = data.item.value;
    } else {
      const newJwtSecret = uuidv4();
      const result = await storageConnection.setConfig('jwtSecret', newJwtSecret);
      if (result && result.item && result.item.key === 'jwtSecret') {
        JWT_SECRET = result.item.value;
      }
    }
    return JWT_SECRET || false;
  } catch (err) {
    console.error('An error occurred in addJWTSecret:', err);
    throw err;
  }
};

exports.getJWTSecret = () => {
  if (JWT_SECRET) {
    return JWT_SECRET;
  } else {
    return false;
  }
};
