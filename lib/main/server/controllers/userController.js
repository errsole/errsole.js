const path = require('path');
const Jsonapi = require('../utils/jsonapiUtil');
const jwt = require('jsonwebtoken');
const helpers = require('../utils/helpers');
const { getStorageConnection } = require('../storageConnection');

exports.serveIndexPage = (req, res) => {
  res.sendFile(path.join(__dirname, '..', '..', '..', 'web', 'index.html'));
};

exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role } = helpers.extractAttributes(req.body);
    const storageConnection = getStorageConnection();
    const userCountResult = await storageConnection.getUserCount();

    if (userCountResult && userCountResult.count !== 0) {
      const errorData = [{
        error: 'Conflict',
        message: 'Main account already created'
      }];
      res.status(409).send({ errors: errorData });
    } else {
      const createUserResult = await storageConnection.createUser({ name, email, password, role });

      if (createUserResult && createUserResult.item) {
        if (!helpers.getJWTSecret()) {
          const result = await helpers.addJWTSecret();
          if (!result) {
            const errorData = [{
              error: 'Internal Server Error',
              message: 'An internal server error occurred'
            }];
            res.status(500).send({ errors: errorData });
            return;
          }
        }

        const JWT_SECRET = helpers.getJWTSecret();
        const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '1w' });
        const successData = {
          name,
          email,
          token
        };

        res.status(201).send(Jsonapi.Serializer.serialize(Jsonapi.UserType, successData));
      } else {
        const errorData = [{
          error: 'Internal Server Error',
          message: createUserResult && createUserResult.error ? createUserResult.error : 'An internal server error occurred'
        }];
        res.status(500).send({ errors: errorData });
      }
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({
      errors: [{
        error: 'Internal Server Error',
        message: error && error.message ? error.message : 'An unexpected error occurred'
      }]
    });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = helpers.extractAttributes(req.body);
    const storageConnection = getStorageConnection();

    if (!helpers.getJWTSecret()) {
      const result = await helpers.addJWTSecret();
      if (!result) {
        const errorData = [{
          error: 'Internal Server Error',
          message: 'An internal server error occurred'
        }];
        res.status(500).send({ errors: errorData });
        return;
      }
    }

    if (email && password) {
      const verifyUserResult = await storageConnection.verifyUser(email, password);
      if (verifyUserResult && verifyUserResult.item && verifyUserResult.item.email === email) {
        const JWT_SECRET = helpers.getJWTSecret();
        const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '1w' });
        const loginData = {
          token
        };
        res.status(200).send(Jsonapi.Serializer.serialize(Jsonapi.UserType, loginData));
      } else {
        const errorData = [{
          error: 'Unauthorized',
          message: verifyUserResult && verifyUserResult.error ? verifyUserResult.error : 'Login failed, please check your credentials'
        }];
        res.status(401).send({ errors: errorData });
      }
    } else {
      res.status(400).send({ error: 'Bad Request', message: 'Email or password is missing' });
    }
  } catch (err) {
    const errorData = [{
      error: 'Internal Server Error',
      message: err ? err.message : 'An unexpected error occurred'
    }];
    res.status(500).send({ errors: errorData });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const email = req.email;
    const storageConnection = getStorageConnection();
    if (email) {
      const userDetailsResult = await storageConnection.getUserByEmail(email);
      if (userDetailsResult && userDetailsResult.item && userDetailsResult.item.email) {
        res.status(200).send(Jsonapi.Serializer.serialize(Jsonapi.UserType, userDetailsResult.item));
      } else {
        const errorData = [{
          error: 'Internal Server Error',
          message: userDetailsResult && userDetailsResult.error ? userDetailsResult.error : 'An internal server error occurred'
        }];
        res.status(500).send({ errors: errorData });
      }
    } else {
      const errorData = [{
        error: 'Bad Request',
        message: 'invalid request'
      }];
      res.status(400).send({ errors: errorData });
    }
  } catch (err) {
    const errorData = [{
      error: 'Internal Server Error',
      message: err ? err.message : 'An unexpected error occurred'
    }];
    res.status(500).send({ errors: errorData });
  }
};

exports.updateUserProfile = async (req, res) => {
  try {
    const email = req.email;
    const { name } = helpers.extractAttributes(req.body);
    const storageConnection = getStorageConnection();
    if (email) {
      const userDetailsResult = await storageConnection.updateUserByEmail(email, { name });
      if (userDetailsResult && userDetailsResult.item && userDetailsResult.item.email === email) {
        const userData = {
          name,
          email
        };
        res.status(200).send(Jsonapi.Serializer.serialize(Jsonapi.UserType, userData));
      } else {
        const errorData = [{
          error: 'Internal Server Error',
          message: userDetailsResult && userDetailsResult.error ? userDetailsResult.error : 'An internal server error occurred'
        }];
        res.status(500).send({ errors: errorData });
      }
    } else {
      const errorData = [{
        error: 'Bad Request',
        message: 'invalid request'
      }];
      res.status(400).send({ errors: errorData });
    }
  } catch (err) {
    const errorData = [{
      error: 'Internal Server Error',
      message: err ? err.message : 'An unexpected error occurred'
    }];
    res.status(500).send({ errors: errorData });
  }
};

exports.updateUserPassword = async (req, res) => {
  try {
    const email = req.email;
    const { currentPassword, newPassword } = helpers.extractAttributes(req.body);
    const storageConnection = getStorageConnection();
    if (email) {
      const userDetailsResult = await storageConnection.updatePassword(email, currentPassword, newPassword);
      if (userDetailsResult && userDetailsResult.item && userDetailsResult.item.email === email) {
        const userData = {
          email
        };
        res.status(200).send(Jsonapi.Serializer.serialize(Jsonapi.UserType, userData));
      } else {
        const errorData = [{
          error: 'Internal Server Error',
          message: userDetailsResult && userDetailsResult.message ? userDetailsResult.message : 'An internal server error occurred'
        }];
        res.status(500).send({ errors: errorData });
      }
    } else {
      const errorData = [{
        error: 'Bad Request',
        message: 'invalid request'
      }];
      res.status(400).send({ errors: errorData });
    }
  } catch (err) {
    const errorData = [{
      error: 'Internal Server Error',
      message: err ? err.message : 'An unexpected error occurred'
    }];
    res.status(500).send({ errors: errorData });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const email = req.email;
    const storageConnection = getStorageConnection();
    if (email) {
      const allUsersDetails = await storageConnection.getAllUsers();
      if (allUsersDetails && allUsersDetails.items) {
        res.status(200).send(Jsonapi.Serializer.serialize(Jsonapi.UserType, allUsersDetails.items));
      } else {
        throw new Error('An unexpected error occurred');
      }
    } else {
      const errorData = [{
        error: 'Bad Request',
        message: 'invalid request'
      }];
      res.status(400).send({ errors: errorData });
    }
  } catch (err) {
    const errorData = [{
      error: 'Internal Server Error',
      message: err ? err.message : 'An unexpected error occurred'
    }];
    res.status(500).send({ errors: errorData });
  }
};

exports.getAdminName = async (req, res) => {
  try {
    const storageConnection = getStorageConnection();
    if (typeof storageConnection.getAdminName !== 'function') {
      return res.status(200).send();
    }
    const adminName = await storageConnection.getAdminName();
    return res.status(200).send(Jsonapi.Serializer.serialize(Jsonapi.UserType, { name: adminName }));
  } catch (err) {
    const errorData = [{
      error: 'Internal Server Error',
      message: err ? err.message : 'An unexpected error occurred'
    }];
    res.status(500).send({ errors: errorData });
  }
};

exports.addUser = async (req, res) => {
  try {
    const adminEmail = req.email;
    const { email, password, role } = helpers.extractAttributes(req.body);
    const storageConnection = getStorageConnection();

    if (adminEmail && email && password && role) {
      const userDetails = await storageConnection.getUserByEmail(adminEmail);
      if (userDetails && userDetails.item && userDetails.item.role === 'admin') {
        const createUserResult = await storageConnection.createUser({ name: 'User', email, password, role });
        if (createUserResult && createUserResult.item && createUserResult.item.email === email) {
          res.status(200).send(Jsonapi.Serializer.serialize(Jsonapi.UserType, createUserResult));
        } else {
          const errorData = [{
            error: 'Internal Server Error',
            message: createUserResult.error || 'An internal server error occurred'
          }];
          res.status(500).send({ errors: errorData });
        }
      } else {
        const errorData = [{
          error: 'Forbidden',
          message: (userDetails && userDetails.error) ? userDetails.error : 'Not allowed'
        }];
        res.status(403).send({ errors: errorData });
      }
    } else {
      const errorData = [{
        error: 'Bad Request',
        message: 'invalid request'
      }];
      res.status(400).send({ errors: errorData });
    }
  } catch (err) {
    const errorData = [{
      error: 'Internal Server Error',
      message: err ? err.message : 'An unexpected error occurred'
    }];
    res.status(500).send({ errors: errorData });
  }
};

exports.removeUser = async (req, res) => {
  try {
    const email = req.email;
    const userId = req.params.userId;
    const storageConnection = getStorageConnection();
    if (email && userId) {
      const userDetails = await storageConnection.getUserByEmail(email);
      if (userDetails && userDetails.item && userDetails.item.role === 'admin') {
        const result = await storageConnection.deleteUser(userId);
        if (result) {
          res.status(200).send(Jsonapi.Serializer.serialize(Jsonapi.UserType, result));
        } else {
          const errorData = [{
            error: 'Internal Server Error',
            message: result.error || 'An internal server error occurred'
          }];
          res.status(500).send({ errors: errorData });
        }
      } else {
        const errorData = [{
          error: 'Forbidden',
          message: (userDetails && userDetails.error) ? userDetails.error : 'Not allowed'
        }];
        res.status(403).send({ errors: errorData });
      }
    } else {
      const errorData = [{
        error: 'Bad Request',
        message: 'invalid request'
      }];
      res.status(400).send({ errors: errorData });
    }
  } catch (err) {
    const errorData = [{
      error: 'Internal Server Error',
      message: err ? err.message : 'An unexpected error occurred'
    }];
    res.status(500).send({ errors: errorData });
  }
};

exports.getTotalUsers = async (req, res) => {
  try {
    const storageConnection = getStorageConnection();
    const userCountResult = await storageConnection.getUserCount();
    const data = {
      count: userCountResult.count
    };
    res.send(Jsonapi.Serializer.serialize(Jsonapi.UserType, data));
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'An error occurred while fetching user count.' });
  }
};
