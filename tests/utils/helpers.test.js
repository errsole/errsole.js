const { v4: uuidv4 } = require('uuid');
const { getStorageConnection } = require('../../lib/main/server/storageConnection');

const {
  extractAttributes,
  SlackUrl,
  getJWTSecret
} = require('../../lib/main/server/utils/helpers');
const requireHelpers = () => require('../../lib/main/server/utils/helpers');

// Mocking external dependencies
jest.mock('../../lib/main/server/storageConnection');
jest.mock('uuid');

/* globals expect, jest, it, beforeEach, describe, afterEach, beforeAll, afterAll */

describe('Utils Functions', () => {
  let originalConsoleError;

  beforeAll(() => {
    // Mock console.error to prevent actual logging during tests
    originalConsoleError = console.error;
    console.error = jest.fn();
  });

  afterAll(() => {
    // Restore console.error after tests
    console.error = originalConsoleError;
  });

  beforeEach(() => {
    // Clear all mock data before each test
    jest.clearAllMocks();
  });

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

  describe('#SlackUrl', () => {
    const validSlackWebhookUrl = process.env.SLACK_WEBHOOK_URL || 'https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX';

    it('should return true for a valid Slack URL', () => {
      expect(SlackUrl(validSlackWebhookUrl)).toBe(true);
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

  describe('#addJWTSecret', () => {
    let storageConnectionMock;

    beforeEach(() => {
      storageConnectionMock = {
        getConfig: jest.fn(),
        setConfig: jest.fn()
      };
      getStorageConnection.mockReturnValue(storageConnectionMock);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should retrieve the existing JWT secret', async () => {
      storageConnectionMock.getConfig.mockResolvedValue({
        item: { key: 'jwtSecret', value: 'existingSecret' }
      });

      const helpers = requireHelpers();
      const { addJWTSecret, getJWTSecret } = helpers;

      const result = await addJWTSecret();
      expect(result).toBe('existingSecret');
      expect(storageConnectionMock.getConfig).toHaveBeenCalledWith('jwtSecret');

      // Verify that getJWTSecret returns the correct value
      expect(getJWTSecret()).toBe('existingSecret');
    });

    it('should create a new JWT secret if not found', async () => {
      uuidv4.mockReturnValue('newGeneratedSecret');
      storageConnectionMock.getConfig.mockResolvedValue(null);
      storageConnectionMock.setConfig.mockResolvedValue({
        item: { key: 'jwtSecret', value: 'newGeneratedSecret' }
      });

      const helpers = requireHelpers();
      const { addJWTSecret, getJWTSecret } = helpers;

      const result = await addJWTSecret();
      expect(result).toBe('newGeneratedSecret');
      expect(storageConnectionMock.getConfig).toHaveBeenCalledWith('jwtSecret');
      expect(storageConnectionMock.setConfig).toHaveBeenCalledWith('jwtSecret', 'newGeneratedSecret');

      // Verify that getJWTSecret returns the new secret
      expect(getJWTSecret()).toBe('newGeneratedSecret');
    });

    it('should handle errors during getConfig', async () => {
      const error = new Error('Something went wrong');
      storageConnectionMock.getConfig.mockRejectedValue(error);

      const helpers = requireHelpers();
      const { addJWTSecret } = helpers;

      await expect(addJWTSecret()).rejects.toThrow(error);
      expect(console.error).toHaveBeenCalledWith('An error occurred in addJWTSecret:', error);
    });

    it('should handle errors during setConfig', async () => {
      uuidv4.mockReturnValue('newGeneratedSecret');
      storageConnectionMock.getConfig.mockResolvedValue(null);
      const error = new Error('Set config failed');
      storageConnectionMock.setConfig.mockRejectedValue(error);

      const helpers = requireHelpers();
      const { addJWTSecret } = helpers;

      await expect(addJWTSecret()).rejects.toThrow(error);
      expect(console.error).toHaveBeenCalledWith('An error occurred in addJWTSecret:', error);
    });

    // **New Test Cases to Cover Specific Branches**

    it('should set JWT_SECRET when setConfig returns the correct structure', async () => {
      uuidv4.mockReturnValue('anotherNewSecret');
      storageConnectionMock.getConfig.mockResolvedValue(null);
      storageConnectionMock.setConfig.mockResolvedValue({
        item: { key: 'jwtSecret', value: 'anotherNewSecret' }
      });

      const helpers = requireHelpers();
      const { addJWTSecret, getJWTSecret } = helpers;

      const result = await addJWTSecret();
      expect(result).toBe('anotherNewSecret');
      expect(storageConnectionMock.setConfig).toHaveBeenCalledWith('jwtSecret', 'anotherNewSecret');
      expect(getJWTSecret()).toBe('anotherNewSecret');
    });
  });

  describe('#getJWTSecret', () => {
    beforeEach(() => {
      jest.resetModules();
    });

    it('should return JWT_SECRET if defined', async () => {
      const secret = getJWTSecret();
      expect(secret).toBeDefined();
    });

    it('should return false if JWT_SECRET is not defined', () => {
      const helpers = require('../../lib/main/server/utils/helpers');
      const { getJWTSecret: retrieveJWTSecret } = helpers;

      const storageConnectionMock = {
        getConfig: jest.fn().mockResolvedValue(null),
        setConfig: jest.fn()
      };
      getStorageConnection.mockReturnValue(storageConnectionMock);

      const retrievedSecret = retrieveJWTSecret();

      expect(retrievedSecret).toBe(false);
    });

    it('should return false if JWT_SECRET has not been initialized', () => {
      const helpers = require('../../lib/main/server/utils/helpers');
      const { getJWTSecret: retrieveJWTSecret } = helpers;

      const retrievedSecret = retrieveJWTSecret();

      expect(retrievedSecret).toBe(false);
    });
  });
});
