const jwt = require('jsonwebtoken');
const Jsonapi = require('../utils/jsonapiUtil');
const helpers = require('../utils/helpers');

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
