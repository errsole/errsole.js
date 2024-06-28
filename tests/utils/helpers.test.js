const { v4: uuidv4 } = require('uuid');
const { getStorageConnection } = require('../../lib/main/server/storageConnection');
const {
  extractAttributes,
  SlackUrl,
  addJWTSecret,
  getJWTSecret
} = require('../../lib/main/server/utils/helpers');

/* globals expect, jest, it, beforeEach, describe, afterEach, beforeAll, afterAll */

// Mocking external dependencies
jest.mock('../../lib/main/server/storageConnection');
jest.mock('uuid');

describe('Utils Functions', () => {
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

  // Tests for extractAttributes
  describe('#extractAttributes', () => {
    it('should return attributes if they exist', () => {
      const data = { data: { attributes: { key: 'value' } } };
      expect(extractAttributes(data)).toEqual({ key: 'value' });
    });

    it('should return an empty object if attributes do not exist', () => {
      const data = {};
      expect(extractAttributes(data)).toEqual({});
    });
  });

  // Tests for SlackUrl
  describe('#SlackUrl', () => {
    it('should return true for a valid Slack URL', () => {
      const url = 'https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX';
      expect(SlackUrl(url)).toBe(true);
    });

    it('should return false for an invalid Slack URL', () => {
      const url = 'https://invalid.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX';
      expect(SlackUrl(url)).toBe(false);
    });

    it('should return false for a non-Slack URL', () => {
      const url = 'https://example.com';
      expect(SlackUrl(url)).toBe(false);
    });
  });

  // Tests for addJWTSecret
  describe('#addJWTSecret', () => {
    let storageConnection;

    beforeEach(() => {
      storageConnection = {
        getConfig: jest.fn(),
        setConfig: jest.fn()
      };
      getStorageConnection.mockReturnValue(storageConnection);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should retrieve the existing JWT secret', async () => {
      storageConnection.getConfig.mockResolvedValue({
        item: { key: 'jwtSecret', value: 'existingSecret' }
      });

      const result = await addJWTSecret();
      expect(result).toBe('existingSecret');
      expect(storageConnection.getConfig).toHaveBeenCalledWith('jwtSecret');
    });

    it('should create a new JWT secret if not found', async () => {
      uuidv4.mockReturnValue('newGeneratedSecret');
      storageConnection.getConfig.mockResolvedValue(null);
      storageConnection.setConfig.mockResolvedValue({
        item: { key: 'jwtSecret', value: 'newGeneratedSecret' }
      });

      const result = await addJWTSecret();
      expect(result).toBe('newGeneratedSecret');
      expect(storageConnection.getConfig).toHaveBeenCalledWith('jwtSecret');
      expect(storageConnection.setConfig).toHaveBeenCalledWith('jwtSecret', 'newGeneratedSecret');
    });

    it('should handle errors', async () => {
      const error = new Error('Something went wrong');
      storageConnection.getConfig.mockRejectedValue(error);

      await expect(addJWTSecret()).rejects.toThrow(error);
      expect(console.error).toHaveBeenCalledWith('An error occurred in addJWTSecret:', error);
    });
  });

  describe('#getJWTSecret', () => {
    it('should return JWT_SECRET if defined', async () => {
      const secret = getJWTSecret();
      expect(secret).toBeDefined();
    });
  });
});
