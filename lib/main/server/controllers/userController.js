const path = require('path');
const Jsonapi = require('../utils/jsonapiUtil');
const jwt = require('jsonwebtoken');
const helpers = require('../utils/helpers');
const { getStorageConnection } = require('../storageConnection');

exports.serveIndexPage = (req, res) => {
  res.sendFile(path.join(__dirname, '..', '..', '..', 'web', 'index.html'));
};

exports.createUser = async (req, res) => {
  const { name, email, password, role } = helpers.extractAttributes(req.body);
  const storageConnection = getStorageConnection();
  const numberOfUsers = await storageConnection.getNumberOfUsers();
  if (numberOfUsers !== 0) {
    const errorData = [{
      error: 'Conflict',
      message: 'Main account already created'
    }];
    res.status(409).send({ errors: errorData });
  } else {
    const createUserResult = await storageConnection.createUser({ name, email, password, role });
    if (createUserResult && createUserResult.status) {
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
        status: 'success',
        name,
        email,
        token
      };
      res.status(201).send(Jsonapi.Serializer.serialize(Jsonapi.UserType, successData));
    } else {
      const errorData = [{
        error: 'Internal Server Error',
        message: 'An internal server error occurred'
      }];
      res.status(500).send({ errors: errorData });
    }
  }
};

exports.loginUser = async (req, res) => {
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
    try {
      const verifyUserResult = await storageConnection.verifyUser({ email, password });
      if (verifyUserResult) {
        const JWT_SECRET = helpers.getJWTSecret();
        const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '1w' });
        const loginData = {
          token
        };
        res.status(200).send(Jsonapi.Serializer.serialize(Jsonapi.UserType, loginData));
      } else {
        const errorData = [{
          error: 'Internal Server Error',
          message: 'An internal server error occurred'
        }];
        res.status(500).send({ errors: errorData });
      }
    } catch (err) {
      const errorData = [{
        error: 'Bad Request',
        message: err ? err.message : 'Something went wrong'
      }];
      res.status(400).send({ errors: errorData });
    }
  } else {
    res.status(400).send('email or password is incorrect');
  }
};

exports.getUserProfile = async (req, res) => {
  const email = req.email;
  const storageConnection = getStorageConnection();
  if (email) {
    try {
      const userDetails = await storageConnection.getUserProfile(email);
      if (userDetails && userDetails.status) {
        res.status(200).send(Jsonapi.Serializer.serialize(Jsonapi.UserType, userDetails.data));
      } else {
        const errorData = [{
          error: 'Internal Server Error',
          message: 'An internal server error occurred'
        }];
        res.status(500).send({ errors: errorData });
      }
    } catch (err) {
      const errorData = [{
        error: 'Internal Server Error',
        message: 'An internal server error occurred'
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
};

exports.updateUserProfile = async (req, res) => {
  const email = req.email;
  const { name } = helpers.extractAttributes(req.body);
  const storageConnection = getStorageConnection();
  if (email) {
    try {
      const userDetails = await storageConnection.updateUserProfile(email, { name });
      if (userDetails) {
        if (userDetails.status) {
          const userData = {
            name,
            email
          };
          res.status(200).send(Jsonapi.Serializer.serialize(Jsonapi.UserType, userData));
        } else {
          const errorData = [{
            error: 'Bad Request',
            message: userDetails.error
          }];
          res.status(400).send({ errors: errorData });
        }
      } else {
        const errorData = [{
          error: 'Internal Server Error',
          message: 'An internal server error occurred'
        }];
        res.status(500).send({ errors: errorData });
      }
    } catch (err) {
      const errorData = [{
        error: 'Internal Server Error',
        message: 'An internal server error occurred'
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
};

exports.updateUserPassword = async (req, res) => {
  const email = req.email;
  const { currentPassword, newPassword } = helpers.extractAttributes(req.body);
  const storageConnection = getStorageConnection();
  if (email) {
    try {
      const userDetails = await storageConnection.updatePassword(email, currentPassword, newPassword);
      if (userDetails) {
        if (userDetails.status) {
          const userData = {
            email
          };
          res.status(200).send(Jsonapi.Serializer.serialize(Jsonapi.UserType, userData));
        } else {
          const errorData = [{
            error: 'Bad Request',
            message: userDetails.error
          }];
          res.status(400).send({ errors: errorData });
        }
      } else {
        const errorData = [{
          error: 'Internal Server Error',
          message: 'An internal server error occurred'
        }];
        res.status(500).send({ errors: errorData });
      }
    } catch (err) {
      const errorData = [{
        error: 'Internal Server Error',
        message: 'An internal server error occurred'
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
};

exports.getAllUsers = async (req, res) => {
  const email = req.email;
  const storageConnection = getStorageConnection();
  if (email) {
    try {
      const allUsersDetails = await storageConnection.getAllUsers();
      res.status(200).send(Jsonapi.Serializer.serialize(Jsonapi.UserType, allUsersDetails.data));
    } catch (err) {
      const errorData = [{
        error: 'Internal Server Error',
        message: 'An internal server error occurred'
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
};

exports.addUser = async (req, res) => {
  const adminEmail = req.email;
  const { email, password } = helpers.extractAttributes(req.body);
  const storageConnection = getStorageConnection();

  if (adminEmail && email && password) {
    try {
      const userDetails = await storageConnection.getUserProfile(adminEmail);
      if (userDetails && userDetails.data && userDetails.data.role === 'admin') {
        const createUserResult = await storageConnection.createUser({ name: 'User', email, password, role: 'developer' });
        if (createUserResult && createUserResult.status) {
          res.status(200).send(Jsonapi.Serializer.serialize(Jsonapi.UserType, createUserResult));
        } else {
          const errorData = [{
            error: 'Internal Server Error1',
            message: createUserResult.error || 'An internal server error occurred1'
          }];
          res.status(500).send({ errors: errorData });
        }
      } else {
        const errorData = [{
          error: 'Forbidden',
          message: 'Not allowed'
        }];
        res.status(403).send({ errors: errorData });
      }
    } catch (err) {
      const errorData = [{
        error: 'Internal Server Error2',
        message: err.message || 'An internal server error occurred2'
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
};

exports.removeUser = async (req, res) => {
  const email = req.email;
  const userId = req.params.userId;
  const storageConnection = getStorageConnection();
  if (email && userId) {
    try {
      const userDetails = await storageConnection.getUserProfile(email);
      if (userDetails && userDetails.data && userDetails.data.role === 'admin') {
        const result = await storageConnection.removeUser(userId);
        if (result && result.status) {
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
          message: 'Not allowed'
        }];
        res.status(403).send({ errors: errorData });
      }
    } catch (err) {
      const errorData = [{
        error: 'Internal Server Error',
        message: 'An internal server error occurred'
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
};

exports.getTotalUsers = async (req, res) => {
  const storageConnection = getStorageConnection();
  const numberOfUsers = await storageConnection.getNumberOfUsers();
  const data = {
    total_users: numberOfUsers
  };
  res.send(Jsonapi.Serializer.serialize(Jsonapi.UserType, data));
};
