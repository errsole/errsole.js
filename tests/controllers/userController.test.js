const { createUser, loginUser, getUserProfile, updateUserProfile, updateUserPassword, getAllUsers, addUser, removeUser, getTotalUsers, getAdminName } = require('../../lib/main/server/controllers/userController');
const helpers = require('../../lib/main/server/utils/helpers');
const { getStorageConnection } = require('../../lib/main/server/storageConnection');
const Jsonapi = require('../../lib/main/server/utils/jsonapiUtil');
const jwt = require('jsonwebtoken');

/* globals expect, jest,  it, beforeAll, afterAll, beforeEach, describe */

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
    jest.clearAllMocks();
  });

  describe('#createUser', () => {
    it('should successfully create a user when no users exist and generate JWT token', async () => {
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
        errors: [{ error: 'Internal Server Error', message: 'Storage error' }]
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
    beforeEach(() => {
      jest.clearAllMocks();
    });

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
        verifyUser: jest.fn().mockResolvedValue(null)
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

      const mockStorageConnection = {
        verifyUser: jest.fn().mockResolvedValue({ item: { email: req.body.data.attributes.email, password: req.body.data.attributes.password } })
      };
      getStorageConnection.mockReturnValue(mockStorageConnection);
      helpers.getJWTSecret.mockReturnValue(null);
      helpers.addJWTSecret.mockResolvedValue(false);

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

    it('should return 500 status code for unexpected errors', async () => {
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
        verifyUser: jest.fn().mockRejectedValue(new Error('Unexpected error'))
      };
      getStorageConnection.mockReturnValue(mockStorageConnection);
      helpers.extractAttributes.mockReturnValue(req.body.data.attributes);

      await loginUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        errors: [{ error: 'Internal Server Error', message: 'An internal server error occurred' }]
      });
    });

    it('should handle JWT secret addition when not available and proceed with login', async () => {
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
      helpers.extractAttributes.mockReturnValue(req.body.data.attributes);
      helpers.getJWTSecret.mockReturnValueOnce(null).mockReturnValueOnce('secret');
      helpers.addJWTSecret.mockResolvedValue(true);
      jwt.sign.mockReturnValue('token');
      Jsonapi.Serializer.serialize.mockReturnValue({ data: { token: 'token' } });

      await loginUser(req, res);

      expect(helpers.getJWTSecret).toHaveBeenCalledTimes(2);
      expect(helpers.addJWTSecret).toHaveBeenCalled();
      expect(mockStorageConnection.verifyUser).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({ data: { token: 'token' } });
    });

    it('should return 400 status code when email is missing', async () => {
      const req = {
        body: {
          data: {
            attributes: {
              password: 'password123'
            }
          }
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      helpers.extractAttributes.mockReturnValue({ password: 'password123' });

      await loginUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({
        error: 'Bad Request',
        message: 'Email or password is missing'
      });
    });

    it('should return 400 status code when password is missing', async () => {
      const req = {
        body: {
          data: {
            attributes: {
              email: 'test@example.com'
            }
          }
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      helpers.extractAttributes.mockReturnValue({ email: 'test@example.com' });

      await loginUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({
        error: 'Bad Request',
        message: 'Email or password is missing'
      });
    });

    it('should return 500 status code for unexpected errors', async () => {
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

      helpers.extractAttributes.mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      await loginUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        errors: [{
          error: 'Internal Server Error',
          message: 'Unexpected error'
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

  describe('#updateUserProfile', () => {
    it('should update user profile successfully with valid email and name', async () => {
      const req = {
        email: 'test@example.com',
        body: {
          data: {
            attributes: {
              name: 'updated name'
            }
          }
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      helpers.extractAttributes.mockReturnValue({ name: 'updated name' });

      const mockStorageConnection = {
        updateUserByEmail: jest.fn().mockResolvedValue({
          item: {
            email: 'test@example.com',
            name: 'updated name'
          }
        })
      };
      getStorageConnection.mockReturnValue(mockStorageConnection);
      Jsonapi.Serializer.serialize.mockReturnValue({ data: { name: 'updated name', email: 'test@example.com' } });

      await updateUserProfile(req, res);

      expect(helpers.extractAttributes).toHaveBeenCalledWith(req.body);
      expect(mockStorageConnection.updateUserByEmail).toHaveBeenCalledWith('test@example.com', { name: 'updated name' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({ data: { name: 'updated name', email: 'test@example.com' } });
    });

    it('should return an error message for a bad request when no email is provided', async () => {
      const req = {
        body: {
          data: {
            attributes: {
              name: 'updated name'
            }
          }
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      await updateUserProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({
        errors: [{ error: 'Bad Request', message: 'invalid request' }]
      });
    });

    it('should handle user update failure due to non-existent user or database error', async () => {
      const req = {
        email: 'test@example.com',
        body: {
          data: {
            attributes: {
              name: 'updated name'
            }
          }
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      // Mocking storageConnection.updateUserByEmail to simulate a failure in finding the user or a database issue
      const mockStorageConnection = {
        updateUserByEmail: jest.fn().mockResolvedValue(null) // Simulate no user found or no update performed
      };
      getStorageConnection.mockReturnValue(mockStorageConnection);
      helpers.extractAttributes.mockReturnValue({ name: 'updated name' });

      await updateUserProfile(req, res);

      expect(mockStorageConnection.updateUserByEmail).toHaveBeenCalledWith('test@example.com', { name: 'updated name' });
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        errors: [{
          error: 'Internal Server Error',
          message: 'An internal server error occurred'
        }]
      });
    });
    it('should handle unexpected errors gracefully', async () => {
      const req = {
        email: 'test@example.com',
        body: {
          data: {
            attributes: {
              name: 'updated name'
            }
          }
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      // Mocking storageConnection.updateUserByEmail to throw an unexpected error
      const mockStorageConnection = {
        updateUserByEmail: jest.fn().mockRejectedValue(new Error('Unexpected error'))
      };
      getStorageConnection.mockReturnValue(mockStorageConnection);
      helpers.extractAttributes.mockReturnValue({ name: 'updated name' });

      await updateUserProfile(req, res);

      expect(mockStorageConnection.updateUserByEmail).toHaveBeenCalledWith('test@example.com', { name: 'updated name' });
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        errors: [{
          error: 'Internal Server Error',
          message: 'Unexpected error'
        }]
      });
    });
  });

  describe('#updateUserPassword', () => {
    it('should update user password successfully with valid email and passwords', async () => {
      const req = {
        email: 'test@example.com',
        body: {
          data: {
            attributes: {
              currentPassword: 'currentPassword',
              newPassword: 'newPassword'
            }
          }
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      helpers.extractAttributes.mockReturnValue({ currentPassword: 'currentPassword', newPassword: 'newPassword' });

      const mockStorageConnection = {
        updatePassword: jest.fn().mockResolvedValue({
          item: {
            email: 'test@example.com'
          }
        })
      };
      getStorageConnection.mockReturnValue(mockStorageConnection);
      Jsonapi.Serializer.serialize.mockReturnValue({ data: { email: 'test@example.com' } });

      await updateUserPassword(req, res);

      expect(helpers.extractAttributes).toHaveBeenCalledWith(req.body);
      expect(mockStorageConnection.updatePassword).toHaveBeenCalledWith('test@example.com', 'currentPassword', 'newPassword');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({ data: { email: 'test@example.com' } });
    });

    it('should return an error message for a bad request when no email is provided', async () => {
      const req = {
        body: {
          data: {
            attributes: {
              currentPassword: 'currentPassword',
              newPassword: 'newPassword'
            }
          }
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      await updateUserPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({
        errors: [{ error: 'Bad Request', message: 'invalid request' }]
      });
    });

    it('should handle user update failure due to non-existent user or database error', async () => {
      const req = {
        email: 'test@example.com',
        body: {
          data: {
            attributes: {
              currentPassword: 'currentPassword',
              newPassword: 'newPassword'
            }
          }
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      // Mocking storageConnection.updatePassword to simulate a failure in finding the user or a database issue
      const mockStorageConnection = {
        updatePassword: jest.fn().mockResolvedValue(null) // Simulate no user found or no update performed
      };
      getStorageConnection.mockReturnValue(mockStorageConnection);
      helpers.extractAttributes.mockReturnValue({ currentPassword: 'currentPassword', newPassword: 'newPassword' });

      await updateUserPassword(req, res);

      expect(mockStorageConnection.updatePassword).toHaveBeenCalledWith('test@example.com', 'currentPassword', 'newPassword');
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        errors: [{
          error: 'Internal Server Error',
          message: 'An internal server error occurred'
        }]
      });
    });

    it('should handle unexpected errors gracefully', async () => {
      const req = {
        email: 'test@example.com',
        body: {
          data: {
            attributes: {
              currentPassword: 'currentPassword',
              newPassword: 'newPassword'
            }
          }
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      // Mocking storageConnection.updatePassword to throw an unexpected error
      const mockStorageConnection = {
        updatePassword: jest.fn().mockRejectedValue(new Error('Unexpected error'))
      };
      getStorageConnection.mockReturnValue(mockStorageConnection);
      helpers.extractAttributes.mockReturnValue({ currentPassword: 'currentPassword', newPassword: 'newPassword' });

      await updateUserPassword(req, res);

      expect(mockStorageConnection.updatePassword).toHaveBeenCalledWith('test@example.com', 'currentPassword', 'newPassword');
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        errors: [{
          error: 'Internal Server Error',
          message: 'Unexpected error'
        }]
      });
    });
  });
  describe('#getAllUsers', () => {
    it('should retrieve all users successfully with valid email', async () => {
      const req = { email: 'test@example.com' };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      const mockUsers = [
        { id: 1, email: 'user1@example.com' },
        { id: 2, email: 'user2@example.com' }
      ];

      const mockStorageConnection = {
        getAllUsers: jest.fn().mockResolvedValue({ items: mockUsers })
      };
      getStorageConnection.mockReturnValue(mockStorageConnection);
      Jsonapi.Serializer.serialize.mockReturnValue({ data: mockUsers });

      await getAllUsers(req, res);

      expect(mockStorageConnection.getAllUsers).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({ data: mockUsers });
    });

    it('should return an error message for a bad request when no email is provided', async () => {
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      await getAllUsers(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({
        errors: [{ error: 'Bad Request', message: 'invalid request' }]
      });
    });

    it('should handle user retrieval failure with an internal server error', async () => {
      const req = { email: 'test@example.com' };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      const mockStorageConnection = {
        getAllUsers: jest.fn().mockResolvedValue(null)
      };
      getStorageConnection.mockReturnValue(mockStorageConnection);

      await getAllUsers(req, res);

      expect(mockStorageConnection.getAllUsers).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        errors: [{ error: 'Internal Server Error', message: 'An unexpected error occurred' }]
      });
    });

    it('should handle unexpected errors gracefully', async () => {
      const req = { email: 'test@example.com' };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      const mockStorageConnection = {
        getAllUsers: jest.fn().mockRejectedValue(new Error('Unexpected error'))
      };
      getStorageConnection.mockReturnValue(mockStorageConnection);

      await getAllUsers(req, res);

      expect(mockStorageConnection.getAllUsers).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        errors: [{ error: 'Internal Server Error', message: 'Unexpected error' }]
      });
    });
  });

  describe('#addUser', () => {
    it('should create a user successfully with valid admin email and user details', async () => {
      const req = {
        email: 'admin@example.com',
        body: {
          data: {
            attributes: {
              email: 'user@example.com',
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

      helpers.extractAttributes.mockReturnValue({ email: 'user@example.com', password: 'password123', role: 'user' });

      const mockAdminUser = {
        item: {
          email: 'admin@example.com',
          role: 'admin'
        }
      };
      const mockCreateUserResult = {
        item: {
          email: 'user@example.com'
        }
      };

      const mockStorageConnection = {
        getUserByEmail: jest.fn().mockResolvedValue(mockAdminUser),
        createUser: jest.fn().mockResolvedValue(mockCreateUserResult)
      };
      getStorageConnection.mockReturnValue(mockStorageConnection);
      Jsonapi.Serializer.serialize.mockReturnValue({ data: { email: 'user@example.com' } });

      await addUser(req, res);

      expect(mockStorageConnection.getUserByEmail).toHaveBeenCalledWith('admin@example.com');
      expect(mockStorageConnection.createUser).toHaveBeenCalledWith({
        name: 'User',
        email: 'user@example.com',
        password: 'password123',
        role: 'user'
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({ data: { email: 'user@example.com' } });
    });

    it('should return a forbidden error when the admin email does not have admin role', async () => {
      const req = {
        email: 'user@example.com',
        body: {
          data: {
            attributes: {
              email: 'user@example.com',
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

      helpers.extractAttributes.mockReturnValue({ email: 'user@example.com', password: 'password123', role: 'user' });

      const mockNonAdminUser = {
        item: {
          email: 'user@example.com',
          role: 'user'
        }
      };

      const mockStorageConnection = {
        getUserByEmail: jest.fn().mockResolvedValue(mockNonAdminUser)
      };
      getStorageConnection.mockReturnValue(mockStorageConnection);

      await addUser(req, res);

      expect(mockStorageConnection.getUserByEmail).toHaveBeenCalledWith('user@example.com');
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.send).toHaveBeenCalledWith({
        errors: [{ error: 'Forbidden', message: 'Not allowed' }]
      });
    });

    it('should return a bad request error when any required field is missing', async () => {
      const req = {
        body: {
          data: {
            attributes: {
              email: 'user@example.com',
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

      await addUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({
        errors: [{ error: 'Bad Request', message: 'invalid request' }]
      });
    });

    it('should handle user creation failure with an internal server error', async () => {
      const req = {
        email: 'admin@example.com',
        body: {
          data: {
            attributes: {
              email: 'user@example.com',
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

      helpers.extractAttributes.mockReturnValue({ email: 'user@example.com', password: 'password123', role: 'user' });

      const mockAdminUser = {
        item: {
          email: 'admin@example.com',
          role: 'admin'
        }
      };

      const mockStorageConnection = {
        getUserByEmail: jest.fn().mockResolvedValue(mockAdminUser),
        createUser: jest.fn().mockResolvedValue({}) // Simulate user creation failure
      };
      getStorageConnection.mockReturnValue(mockStorageConnection);

      await addUser(req, res);

      expect(mockStorageConnection.getUserByEmail).toHaveBeenCalledWith('admin@example.com');
      expect(mockStorageConnection.createUser).toHaveBeenCalledWith({
        name: 'User',
        email: 'user@example.com',
        password: 'password123',
        role: 'user'
      });
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        errors: [{ error: 'Internal Server Error', message: 'An internal server error occurred' }]
      });
    });

    it('should handle unexpected errors gracefully', async () => {
      const req = {
        email: 'admin@example.com',
        body: {
          data: {
            attributes: {
              email: 'user@example.com',
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

      helpers.extractAttributes.mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      await addUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        errors: [{ error: 'Internal Server Error', message: 'Unexpected error' }]
      });
    });
  });

  describe('#getAdminName', () => {
    it('should return the admin name successfully when getAdminName function exists', async () => {
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      const mockStorageConnection = {
        getAdminName: jest.fn().mockResolvedValue('Admin User')
      };
      getStorageConnection.mockReturnValue(mockStorageConnection);
      Jsonapi.Serializer.serialize.mockReturnValue({ data: { name: 'Admin User' } });

      await getAdminName(req, res);

      expect(mockStorageConnection.getAdminName).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({ data: { name: 'Admin User' } });
    });

    it('should return 200 status with empty response when getAdminName function is not defined', async () => {
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      const mockStorageConnection = {};
      getStorageConnection.mockReturnValue(mockStorageConnection);

      await getAdminName(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith();
    });

    it('should handle errors gracefully and return a 500 status code', async () => {
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      const mockStorageConnection = {
        getAdminName: jest.fn().mockRejectedValue(new Error('Database error'))
      };
      getStorageConnection.mockReturnValue(mockStorageConnection);

      await getAdminName(req, res);

      expect(mockStorageConnection.getAdminName).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        errors: [{ error: 'Internal Server Error', message: 'Database error' }]
      });
    });
  });

  describe('#getTotalUsers', () => {
    it('should retrieve the total user count successfully', async () => {
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      const mockUserCountResult = { count: 100 };

      const mockStorageConnection = {
        getUserCount: jest.fn().mockResolvedValue(mockUserCountResult)
      };
      getStorageConnection.mockReturnValue(mockStorageConnection);
      Jsonapi.Serializer.serialize.mockReturnValue({ data: { count: 100 } });

      await getTotalUsers(req, res);

      expect(mockStorageConnection.getUserCount).toHaveBeenCalled();
      expect(res.send).toHaveBeenCalledWith({ data: { count: 100 } });
    });

    it('should handle errors gracefully', async () => {
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      const mockStorageConnection = {
        getUserCount: jest.fn().mockRejectedValue(new Error('Database error'))
      };
      getStorageConnection.mockReturnValue(mockStorageConnection);

      await getTotalUsers(req, res);

      expect(mockStorageConnection.getUserCount).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({ error: 'An error occurred while fetching user count.' });
    });
  });
  describe('#removeUser', () => {
    it('should remove a user successfully with valid admin email and user ID', async () => {
      const req = {
        email: 'admin@example.com',
        params: { userId: '12345' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      const mockAdminUser = {
        item: {
          email: 'admin@example.com',
          role: 'admin'
        }
      };
      const mockDeleteUserResult = { item: { email: 'user@example.com' } };

      const mockStorageConnection = {
        getUserByEmail: jest.fn().mockResolvedValue(mockAdminUser),
        deleteUser: jest.fn().mockResolvedValue(mockDeleteUserResult)
      };
      getStorageConnection.mockReturnValue(mockStorageConnection);
      Jsonapi.Serializer.serialize.mockReturnValue({ data: { email: 'user@example.com' } });

      await removeUser(req, res);

      expect(mockStorageConnection.getUserByEmail).toHaveBeenCalledWith('admin@example.com');
      expect(mockStorageConnection.deleteUser).toHaveBeenCalledWith('12345');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({ data: { email: 'user@example.com' } });
    });

    it('should return a forbidden error when the admin email does not have admin role', async () => {
      const req = {
        email: 'user@example.com',
        params: { userId: '12345' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      const mockNonAdminUser = {
        item: {
          email: 'user@example.com',
          role: 'user'
        }
      };

      const mockStorageConnection = {
        getUserByEmail: jest.fn().mockResolvedValue(mockNonAdminUser)
      };
      getStorageConnection.mockReturnValue(mockStorageConnection);

      await removeUser(req, res);

      expect(mockStorageConnection.getUserByEmail).toHaveBeenCalledWith('user@example.com');
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.send).toHaveBeenCalledWith({
        errors: [{ error: 'Forbidden', message: 'Not allowed' }]
      });
    });

    it('should return a bad request error when any required field is missing', async () => {
      const req = { params: { userId: '12345' } }; // Missing email
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      await removeUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({
        errors: [{ error: 'Bad Request', message: 'invalid request' }]
      });
    });

    it('should handle unexpected errors gracefully', async () => {
      const req = {
        email: 'admin@example.com',
        params: { userId: '12345' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      const mockStorageConnection = {
        getUserByEmail: jest.fn().mockRejectedValue(new Error('Unexpected error'))
      };
      getStorageConnection.mockReturnValue(mockStorageConnection);

      await removeUser(req, res);

      expect(mockStorageConnection.getUserByEmail).toHaveBeenCalledWith('admin@example.com');
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        errors: [{ error: 'Internal Server Error', message: 'Unexpected error' }]
      });
    });
  });

  describe('#removeUser', () => {
    it('should handle errors gracefully', async () => {
      const req = {
        email: 'admin@example.com',
        params: { userId: '12345' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      const mockStorageConnection = {
        getUserByEmail: jest.fn().mockRejectedValue(new Error('Unexpected error')),
        deleteUser: jest.fn() // This won't be called because getUserByEmail will throw
      };
      getStorageConnection.mockReturnValue(mockStorageConnection);

      await removeUser(req, res);

      expect(mockStorageConnection.getUserByEmail).toHaveBeenCalledWith('admin@example.com');
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        errors: [{
          error: 'Internal Server Error',
          message: 'Unexpected error'
        }]
      });
    });
  });
});
