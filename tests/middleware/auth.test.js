const jwt = require('jsonwebtoken');
const { authenticateToken, authenticateTokenWithAdmin } = require('../../lib/main/server/middleware/auth');
const Jsonapi = require('../../lib/main/server/utils/jsonapiUtil');
const helpers = require('../../lib/main/server/utils/helpers');
const { getStorageConnection } = require('../../lib/main/server/storageConnection');
/* globals expect, jest, it, beforeEach, describe, afterEach */
jest.mock('jsonwebtoken');
jest.mock('../../lib/main/server/utils/jsonapiUtil');
jest.mock('../../lib/main/server/utils/helpers');
jest.mock('../../lib/main/server/storageConnection');

describe('Authentication Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {
        authorization: 'Bearer testToken'
      }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    };
    next = jest.fn();

    Jsonapi.Serializer.serialize.mockReturnValue('serialized data');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('#authenticateToken', () => {
    it('should respond with 401 if no token is provided', async () => {
      req.headers.authorization = null;

      await authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.send).toHaveBeenCalledWith('serialized data');
    });

    it('should respond with 403 if token verification fails', async () => {
      helpers.getJWTSecret.mockReturnValue('secret');
      jwt.verify.mockImplementation((token, secret, callback) => callback(new Error('invalid token')));

      await authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.send).toHaveBeenCalledWith('serialized data');
    });

    it('should call next if token is valid', async () => {
      helpers.getJWTSecret.mockReturnValue('secret');
      jwt.verify.mockImplementation((token, secret, callback) => callback(null, { email: 'test@example.com' }));

      await authenticateToken(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe('#authenticateTokenWithAdmin', () => {
    it('should respond with 401 if no token is provided', async () => {
      req.headers.authorization = null;

      await authenticateTokenWithAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.send).toHaveBeenCalledWith('serialized data');
    });

    it('should respond with 403 if token verification fails', async () => {
      helpers.getJWTSecret.mockReturnValue('secret');
      jwt.verify.mockImplementation((token, secret, callback) => callback(new Error('invalid token')));

      await authenticateTokenWithAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.send).toHaveBeenCalledWith({
        errors: [{
          error: 'Forbidden',
          message: 'Access denied'
        }]
      });
    });

    it('should respond with 403 if user is not an admin', async () => {
      helpers.getJWTSecret.mockReturnValue('secret');
      jwt.verify.mockImplementation((token, secret, callback) => callback(null, { email: 'test@example.com' }));
      getStorageConnection.mockReturnValue({
        getUserByEmail: jest.fn().mockResolvedValue({ item: { role: 'user' } })
      });

      await authenticateTokenWithAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.send).toHaveBeenCalledWith({
        errors: [{
          error: 'Forbidden',
          message: 'Access denied'
        }]
      });
    });

    it('should call next if user is an admin', async () => {
      helpers.getJWTSecret.mockReturnValue('secret');
      jwt.verify.mockImplementation((token, secret, callback) => callback(null, { email: 'test@example.com' }));
      getStorageConnection.mockReturnValue({
        getUserByEmail: jest.fn().mockResolvedValue({ item: { role: 'admin' } })
      });

      await authenticateTokenWithAdmin(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });
});
