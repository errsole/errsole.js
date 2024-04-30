const jwt = require('jsonwebtoken');
const Jsonapi = require('../utils/jsonapiUtil');
const helpers = require('../utils/helpers');
const { getStorageConnection } = require('../storageConnection');

exports.authenticateToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    const errorData = {
      error: 'Unauthorized',
      message: 'invalid session'
    };
    res.status(401).send(Jsonapi.Serializer.serialize(Jsonapi.UserType, errorData));
    return;
  }

  if (!helpers.getJWTSecret()) {
    await helpers.addJWTSecret();
  }
  const JWT_SECRET = helpers.getJWTSecret();
  jwt.verify(token, JWT_SECRET, (err, data) => {
    if (err) {
      const errorData = {
        error: 'Forbidden',
        message: 'try again some time'
      };
      res.status(403).send(Jsonapi.Serializer.serialize(Jsonapi.UserType, errorData));
      return;
    }
    req.email = data.email;
    next();
  });
};

exports.authenticateTokenWithAdmin = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    const errorData = {
      error: 'Unauthorized',
      message: 'invalid session'
    };
    res.status(401).send(Jsonapi.Serializer.serialize(Jsonapi.UserType, errorData));
    return;
  }

  if (!helpers.getJWTSecret()) {
    await helpers.addJWTSecret();
  }
  const JWT_SECRET = helpers.getJWTSecret();
  jwt.verify(token, JWT_SECRET, async (err, data) => {
    if (err) {
      res.status(403).send({
        errors: [{
          error: 'Forbidden',
          message: 'Access denied'
        }]
      });
      return;
    }
    req.email = data.email;
    const storageConnection = getStorageConnection();
    const userDetails = await storageConnection.getUserByEmail(req.email);
    if (userDetails && userDetails.item && userDetails.item.role === 'admin') {
      next();
    } else {
      res.status(403).send({
        errors: [{
          error: 'Forbidden',
          message: 'Access denied'
        }]
      });
    }
  });
};
