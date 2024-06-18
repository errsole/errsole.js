const { createUser, loginUser, getUserProfile } = require('../../lib/main/server/controllers/userController');
const helpers = require('../../lib/main/server/utils/helpers');
const { getStorageConnection } = require('../../lib/main/server/storageConnection');
const Jsonapi = require('../../lib/main/server/utils/jsonapiUtil');
const jwt = require('jsonwebtoken');
const { describe } = require('@jest/globals');
/* globals expect, jest,  it, beforeAll, afterAll, beforeEach */

jest.mock('../../lib/main/server/utils/helpers');
jest.mock('../../lib/main/server/storageConnection');
jest.mock('jsonwebtoken');
jest.mock('../../lib/main/server/utils/jsonapiUtil');

describe('userController', () => {
  let originalConsoleError;

  beforeAll(() => {
    originalConsoleError = console.error;
    console.error = jest.fn();
  });

  afterAll(() => {
    console.error = originalConsoleError;
  });

  beforeEach(() => {
    jest.clearAllMocks(); // Resets all information stored in mocks
  });

  describe('#createUser', () => {
    it('should successfully create a user when no users exist and generate JWT token', async () => {
      // It covers both the creation of the user and the generation of the JWT token
      const req = {
        body: {
          data: {
            attributes: {
              name: 'Test User',
              email: 'test@example.com',
              password: 'password123',
              role: 'user'
            }
          }
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };
      const storageConnection = {
        getUserCount: jest.fn().mockResolvedValue({ count: 0 }),
        createUser: jest.fn().mockResolvedValue({ item: { name: 'Test User', email: 'test@example.com' } })
      };
      getStorageConnection.mockReturnValue(storageConnection);

      helpers.extractAttributes.mockReturnValue(req.body.data.attributes);
      helpers.getJWTSecret.mockReturnValue('secret');
      helpers.addJWTSecret.mockResolvedValue(true);

      jwt.sign.mockReturnValue('token');

      Jsonapi.Serializer.serialize.mockReturnValue({
        data: {
          id: '1',
          type: 'users',
          attributes: {
            name: 'Test User',
            email: 'test@example.com',
            token: 'token'
          }
        }
      });

      await createUser(req, res);

      expect(storageConnection.getUserCount).toHaveBeenCalled();
      expect(storageConnection.createUser).toHaveBeenCalledWith(req.body.data.attributes);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.send).toHaveBeenCalledWith({
        data: {
          id: '1',
          type: 'users',
          attributes: {
            name: 'Test User',
            email: 'test@example.com',
            token: 'token'
          }
        }
      });
    });

    it('should return 409 status code if a user already exists', async () => {
      const req = {
        body: {
          data: {
            attributes: {
              name: 'Test User',
              email: 'test@example.com',
              password: 'password123',
              role: 'admin'
            }
          }
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };
      const mockStorageConnection = {
        getUserCount: jest.fn().mockResolvedValue({ count: 1 })
      };
      getStorageConnection.mockReturnValue(mockStorageConnection);

      helpers.extractAttributes.mockReturnValue(req.body.data.attributes);

      await createUser(req, res);

      expect(mockStorageConnection.getUserCount).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.send).toHaveBeenCalledWith({ errors: [{ error: 'Conflict', message: 'Main account already created' }] });
    });

    it('should handle storage connection errors gracefully', async () => {
      const req = {
        body: {
          data: {
            attributes: {
              name: 'Test User',
              email: 'test@example.com',
              password: 'password123',
              role: 'admin'
            }
          }
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };
      const mockStorageConnection = {
        getUserCount: jest.fn().mockRejectedValue(new Error('Storage error'))
      };
      getStorageConnection.mockReturnValue(mockStorageConnection);

      helpers.extractAttributes.mockReturnValue(req.body.data.attributes);

      await createUser(req, res);

      expect(mockStorageConnection.getUserCount).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        errors: [{ error: 'Internal Server Error', message: 'An unexpected error occurred' }]
      });
    });

    it('should handle JWT secret generation failure', async () => {
      const req = {
        body: {
          data: {
            attributes: {
              name: 'Test User',
              email: 'test@example.com',
              password: 'password123',
              role: 'admin'
            }
          }
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };
      const storageConnection = {
        getUserCount: jest.fn().mockResolvedValue({ count: 0 }),
        createUser: jest.fn().mockResolvedValue({ item: { name: 'Test User', email: 'test@example.com' } })
      };
      getStorageConnection.mockReturnValue(storageConnection);

      helpers.extractAttributes.mockReturnValue(req.body.data.attributes);
      helpers.getJWTSecret.mockReturnValue(null);
      helpers.addJWTSecret.mockResolvedValue(false);

      await createUser(req, res);

      expect(storageConnection.getUserCount).toHaveBeenCalled();
      expect(storageConnection.createUser).toHaveBeenCalledWith(req.body.data.attributes);
      expect(helpers.addJWTSecret).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        errors: [{ error: 'Internal Server Error', message: 'An internal server error occurred' }]
      });
    });

    it('should handle createUser failure', async () => {
      const req = {
        body: {
          data: {
            attributes: {
              name: 'Test User',
              email: 'test@example.com',
              password: 'password123',
              role: 'admin'
            }
          }
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };
      const storageConnection = {
        getUserCount: jest.fn().mockResolvedValue({ count: 0 }),
        createUser: jest.fn().mockResolvedValue(null)
      };
      getStorageConnection.mockReturnValue(storageConnection);

      helpers.extractAttributes.mockReturnValue(req.body.data.attributes);

      await createUser(req, res);

      expect(storageConnection.getUserCount).toHaveBeenCalled();
      expect(storageConnection.createUser).toHaveBeenCalledWith(req.body.data.attributes);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        errors: [{ error: 'Internal Server Error', message: 'An internal server error occurred' }]
      });
    });
  });

  describe('#loginUser', () => {
    it('should return a token when login is successful with correct email and password', async () => {
      const req = {
        body: {
          data: {
            attributes: {
              email: 'test@example.com',
              password: 'password123'
            }
          }
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };
      const mockStorageConnection = {
        verifyUser: jest.fn().mockResolvedValue({ item: { email: 'test@example.com' } })
      };
      getStorageConnection.mockReturnValue(mockStorageConnection);
      helpers.getJWTSecret.mockReturnValue('secret');
      jwt.sign.mockReturnValue('token');

      await loginUser(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          attributes: expect.objectContaining({
            token: 'token'
          })
        })
      }));
    });

    it('should return an error when incorrect password is provided for existing email', async () => {
      const req = {
        body: {
          data: {
            attributes: {
              email: 'test@example.com',
              password: 'incorrectpassword'
            }
          }
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };
      const mockStorageConnection = {
        verifyUser: jest.fn().mockResolvedValue(null) // Indicates that verification failed
      };
      getStorageConnection.mockReturnValue(mockStorageConnection);

      helpers.extractAttributes.mockReturnValue({ email: 'test@example.com', password: 'incorrectpassword' });
      helpers.getJWTSecret.mockReturnValue('secret');

      await loginUser(req, res);

      expect(mockStorageConnection.verifyUser).toHaveBeenCalledWith('test@example.com', 'incorrectpassword');
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.send).toHaveBeenCalledWith({
        errors: [{ error: 'Unauthorized', message: 'Login failed, please check your credentials' }]
      });
    });

    it('should return an error message for a failed login when JWT secret is not available', async () => {
      const req = {
        body: {
          data: {
            attributes: {
              email: 'test@example.com',
              password: 'testpassword'
            }
          }
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      // Mock the storageConnection.verifyUser method to return a valid user
      const mockStorageConnection = {
        verifyUser: jest.fn().mockResolvedValue({ item: { email: req.body.data.attributes.email, password: req.body.data.attributes.password } })
      };
      getStorageConnection.mockReturnValue(mockStorageConnection);

      // Mock the helpers.getJWTSecret method to return null
      helpers.getJWTSecret.mockReturnValue(null);
      helpers.addJWTSecret.mockResolvedValue(false); // Assuming addJWTSecret fails to add a new secret

      await loginUser(req, res);

      expect(helpers.getJWTSecret).toHaveBeenCalled();
      expect(helpers.addJWTSecret).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        errors: [{
          error: 'Internal Server Error',
          message: 'An internal server error occurred'
        }]
      });
    });
  });

  describe('#getUserProfile', () => {
    it('should successfully retrieve and serialize user profile', async () => {
      const req = { email: 'test@example.com' };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };
      const mockUserDetails = {
        item: {
          email: 'test@example.com',
          name: 'Test User'
        }
      };

      const mockStorageConnection = {
        getUserByEmail: jest.fn().mockResolvedValue(mockUserDetails)
      };
      getStorageConnection.mockReturnValue(mockStorageConnection);
      Jsonapi.Serializer.serialize.mockReturnValue({ data: mockUserDetails.item });

      await getUserProfile(req, res);

      expect(mockStorageConnection.getUserByEmail).toHaveBeenCalledWith('test@example.com');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({ data: mockUserDetails.item });
    });

    it('should handle user not found scenario', async () => {
      const req = { email: 'test@example.com' };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };
      const mockStorageConnection = {
        getUserByEmail: jest.fn().mockResolvedValue(null)
      };
      getStorageConnection.mockReturnValue(mockStorageConnection);

      await getUserProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        errors: [{ error: 'Internal Server Error', message: 'An internal server error occurred' }]
      });
    });

    it('should return an error message for a bad request when no email is provided', async () => {
      const req = { email: undefined }; // Simulating missing email in the request
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      await getUserProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({
        errors: [{
          error: 'Bad Request',
          message: 'invalid request'
        }]
      });
    });

    it('should handle exceptions thrown during user retrieval gracefully', async () => {
      const req = { email: 'test@example.com' }; // Assume this is how email is passed in your actual implementation
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      // Simulating an error during database access
      const mockStorageConnection = {
        getUserByEmail: jest.fn().mockRejectedValue(new Error('Database connection error'))
      };
      getStorageConnection.mockReturnValue(mockStorageConnection);

      await getUserProfile(req, res);

      expect(mockStorageConnection.getUserByEmail).toHaveBeenCalledWith('test@example.com');
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        errors: [{
          error: 'Internal Server Error',
          message: 'Database connection error' // Expected to match the thrown error
        }]
      });
    });
  });
});
