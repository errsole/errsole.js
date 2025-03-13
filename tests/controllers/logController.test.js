const { getLogs, getLogsTTL, updateLogsTTL, getLogMeta, getHostnames, deleteAllLogs } = require('../../lib/main/server/controllers/logController');
const Jsonapi = require('../../lib/main/server/utils/jsonapiUtil');
const { getStorageConnection } = require('../../lib/main/server/storageConnection');
const { describe, it } = require('@jest/globals');
const helpers = require('../../lib/main/server/utils/helpers');
/* globals expect, jest, beforeEach, beforeAll, afterAll, afterEach */

jest.mock('../../lib/main/server/storageConnection');
jest.mock('../../lib/main/server/utils/jsonapiUtil');
jest.mock('../../lib/main/server/utils/helpers');

jest.mock('dompurify', () => ({
  sanitize: jest.fn((input) => input)
}));

describe('LogController', () => {
  let originalConsoleError;

  beforeAll(() => {
    originalConsoleError = console.error;
    console.error = jest.fn();
  });

  afterAll(() => {
    console.error = originalConsoleError;
  });

  describe('#getLogs', () => {
    let req, res, mockStorageConnection;

    beforeEach(() => {
      req = { query: {} };
      res = {
        send: jest.fn(),
        status: jest.fn().mockReturnThis()
      };
      mockStorageConnection = {
        searchLogs: jest.fn(),
        getLogs: jest.fn()
      };
      getStorageConnection.mockReturnValue(mockStorageConnection);
      Jsonapi.Serializer.serialize.mockReturnValue({ data: 'serialized data' });
    });

    it('should return logs when search terms are provided with search terms "error,warning"', async () => {
      const req = {
        query: {
          search_terms: 'error,warning',
          limit: '10'
        }
      };
      const res = {
        send: jest.fn(),
        status: jest.fn().mockReturnThis()
      };
      const mockLogs = { items: [{ id: 1, message: 'error log' }, { id: 2, message: 'warning log' }] };
      const mockStorageConnection = {
        searchLogs: jest.fn().mockResolvedValue(mockLogs)
      };
      getStorageConnection.mockReturnValue(mockStorageConnection);

      // Mock Jsonapi.Serializer.serialize to return a value
      Jsonapi.Serializer.serialize.mockReturnValue({ data: 'serialized data' });

      await getLogs(req, res);
      expect(mockStorageConnection.searchLogs).toHaveBeenCalledWith(['error', 'warning'], { limit: 10, search_terms: 'error,warning' });
      expect(res.send).toHaveBeenCalledWith({ data: 'serialized data' });
    });

    it('should handle empty search terms', async () => {
      req.query.search_terms = '';
      req.query.limit = '10';
      req.query.levels = 'info,error';
      req.query.level_json = '[{"key":"value"}]';
      const mockLogs = {
        items: [{ id: 1, message: 'log message' }],
        filters: {}
      };
      mockStorageConnection.getLogs.mockResolvedValue(mockLogs);

      await getLogs(req, res);

      expect(mockStorageConnection.getLogs).toHaveBeenCalledWith({
        limit: 10,
        levels: ['info', 'error'],
        level_json: [{ key: 'value' }],
        search_terms: ''
      });
      expect(res.send).toHaveBeenCalledWith({ data: 'serialized data' });
    });

    it('should handle invalid JSON in level_json gracefully', async () => {
      const req = {
        query: {
          level_json: 'invalid_json'
        }
      };
      const res = {
        send: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      await getLogs(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        errors: [
          {
            error: 'Internal Server Error',
            message: expect.stringMatching(/Unexpected token|Expected property name|invalid JSON/i)
          }
        ]
      });
    });

    it('should return logs when no search terms are provided', async () => {
      req.query.limit = '10';
      const mockLogs = { items: [{ id: 1, message: 'log 1' }, { id: 2, message: 'log 2' }] };
      mockStorageConnection.getLogs.mockResolvedValue(mockLogs);

      await getLogs(req, res);
      expect(mockStorageConnection.getLogs).toHaveBeenCalledWith({ limit: 10 });
      expect(res.send).toHaveBeenCalledWith({ data: 'serialized data' });
    });

    it('should correctly parse limit as an integer', async () => {
      req.query.limit = '10';
      const mockLogs = { items: [{ id: 1, message: 'log 1' }, { id: 2, message: 'log 2' }] };
      mockStorageConnection.getLogs.mockResolvedValue(mockLogs);

      await getLogs(req, res);
      expect(mockStorageConnection.getLogs).toHaveBeenCalledWith({ limit: 10 });
      expect(res.send).toHaveBeenCalledWith({ data: 'serialized data' });
    });

    it('should correctly parse valid level_json', async () => {
      req.query.level_json = '[{"level": "error"}]';
      const mockLogs = { items: [{ id: 1, message: 'log 1' }, { id: 2, message: 'log 2' }] };
      mockStorageConnection.getLogs.mockResolvedValue(mockLogs);

      await getLogs(req, res);
      expect(mockStorageConnection.getLogs).toHaveBeenCalledWith({ level_json: [{ level: 'error' }] });
      expect(res.send).toHaveBeenCalledWith({ data: 'serialized data' });
    });

    it('should return 400 when no logs are found', async () => {
      mockStorageConnection.searchLogs.mockResolvedValue({});
      req.query.search_terms = 'error';

      await getLogs(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({
        errors: [
          {
            error: 'Bad Request',
            message: 'invalid request'
          }
        ]
      });
    });

    it('should set level_json to an array with an empty object when empty', async () => {
      req.query.level_json = '[]';
      const mockLogs = { items: [{ id: 1, message: 'log 1' }, { id: 2, message: 'log 2' }] };
      mockStorageConnection.getLogs.mockResolvedValue(mockLogs);

      await getLogs(req, res);
      expect(mockStorageConnection.getLogs).toHaveBeenCalledWith({ level_json: [{}] });
      expect(res.send).toHaveBeenCalledWith({ data: 'serialized data' });
    });

    it('should handle unexpected errors gracefully', async () => {
      mockStorageConnection.searchLogs.mockRejectedValue(new Error('Unexpected error'));
      req.query.search_terms = 'error';

      await getLogs(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        errors: [
          {
            error: 'Internal Server Error',
            message: 'Unexpected error'
          }
        ]
      });
    });

    it('should return 400 with default error message when logs is empty (no items, no error field)', async () => {
      req.query.search_terms = 'error';
      // Simulate logs object without items and without an error field
      mockStorageConnection.searchLogs.mockResolvedValue({});

      await getLogs(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({
        errors: [
          {
            error: 'Bad Request',
            message: 'invalid request'
          }
        ]
      });
    });

    it('should return 400 with logs.error message when logs does not contain items but has error field', async () => {
      req.query.search_terms = 'error';
      const errorMessage = 'Specific error message';
      // Simulate logs object with an error field
      mockStorageConnection.searchLogs.mockResolvedValue({ error: errorMessage });

      await getLogs(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({
        errors: [
          {
            error: 'Bad Request',
            message: errorMessage
          }
        ]
      });
    });

    it('should handle empty hostnames array', async () => {
      req.query.hostnames = '[]';
      req.query.limit = '10';
      const mockLogs = { items: [{ id: 1, message: 'log message' }] };
      mockStorageConnection.getLogs.mockResolvedValue(mockLogs);

      await getLogs(req, res);

      expect(mockStorageConnection.getLogs).toHaveBeenCalledWith({
        limit: 10,
        hostnames: []
      });
      expect(res.send).toHaveBeenCalledWith({ data: 'serialized data' });
    });

    it('should correctly parse valid hostnames array', async () => {
      req.query.hostnames = '["host1", "host2"]';
      req.query.limit = '10';
      const mockLogs = { items: [{ id: 1, message: 'log message' }] };
      mockStorageConnection.getLogs.mockResolvedValue(mockLogs);

      await getLogs(req, res);

      expect(mockStorageConnection.getLogs).toHaveBeenCalledWith({
        limit: 10,
        hostnames: ['host1', 'host2']
      });
      expect(res.send).toHaveBeenCalledWith({ data: 'serialized data' });
    });

    it('should handle invalid JSON in hostnames gracefully', async () => {
      req.query.hostnames = 'invalid_json';
      req.query.limit = '10';

      await getLogs(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        errors: [
          {
            error: 'Internal Server Error',
            message: expect.stringMatching(/Unexpected token|Expected property name|invalid JSON/i)
          }
        ]
      });
    });
  });

  describe('#getLogsTTL', () => {
    let req, res, mockStorageConnection;

    beforeEach(() => {
      req = {};
      res = {
        send: jest.fn(),
        status: jest.fn().mockReturnThis()
      };
      mockStorageConnection = {
        getConfig: jest.fn()
      };
      getStorageConnection.mockReturnValue(mockStorageConnection);
      Jsonapi.Serializer.serialize.mockReturnValue({ data: 'serialized data' });
    });

    it('should return serialized logsTTL configuration when storageConnection returns valid result', async () => {
      const mockResult = { item: { ttl: 3600 } };
      mockStorageConnection.getConfig.mockResolvedValue(mockResult);

      await getLogsTTL(req, res);

      expect(mockStorageConnection.getConfig).toHaveBeenCalledWith('logsTTL');
      expect(Jsonapi.Serializer.serialize).toHaveBeenCalledWith(Jsonapi.LogType, mockResult.item);
      expect(res.send).toHaveBeenCalledWith({ data: 'serialized data' });
    });

    it('should return 400 if logsTTL configuration is not found', async () => {
      mockStorageConnection.getConfig.mockResolvedValue({});

      await getLogsTTL(req, res);

      expect(mockStorageConnection.getConfig).toHaveBeenCalledWith('logsTTL');
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({
        errors: [
          {
            error: 'Bad Request',
            message: 'invalid request'
          }
        ]
      });
    });
    it('should handle unexpected errors gracefully', async () => {
      mockStorageConnection.getConfig.mockRejectedValue(new Error('Unexpected error'));

      await getLogsTTL(req, res);

      expect(mockStorageConnection.getConfig).toHaveBeenCalledWith('logsTTL');
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        errors: [
          {
            error: 'Internal Server Error',
            message: 'Unexpected error'
          }
        ]
      });
    });

    it('should return 400 with result.error message when logsTTL configuration is missing but error is provided', async () => {
      const errorMessage = 'Configuration not found';
      // Simulate a response where getConfig returns an object with an error field
      mockStorageConnection.getConfig.mockResolvedValue({ error: errorMessage });

      await getLogsTTL(req, res);

      expect(mockStorageConnection.getConfig).toHaveBeenCalledWith('logsTTL');
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({
        errors: [
          {
            error: 'Bad Request',
            message: errorMessage
          }
        ]
      });
    });

    it('should handle unexpected errors gracefully by returning 500 with proper error message', async () => {
      // Create an error with a message
      const error = new Error('Unexpected error');
      mockStorageConnection.getConfig.mockRejectedValue(error);

      await getLogsTTL(req, res);

      expect(mockStorageConnection.getConfig).toHaveBeenCalledWith('logsTTL');
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        errors: [
          {
            error: 'Internal Server Error',
            message: 'Unexpected error'
          }
        ]
      });
    });
  });

  describe('#updateLogsTTL', () => {
    let req, res, mockStorageConnection;

    beforeEach(() => {
      req = { body: {} };
      res = {
        send: jest.fn(),
        status: jest.fn().mockReturnThis()
      };
      mockStorageConnection = {
        setConfig: jest.fn(),
        ensureLogsTTL: jest.fn()
      };
      // Ensure that getStorageConnection returns our mocked storage connection
      getStorageConnection.mockReturnValue(mockStorageConnection);
      // Default: extractAttributes returns an empty object
      helpers.extractAttributes.mockReturnValue({});
      // Default: Jsonapi.Serializer.serialize returns a placeholder value
      Jsonapi.Serializer.serialize.mockReturnValue({ data: 'serialized data' });
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should return 400 error when ttl is not provided', async () => {
      // extractAttributes returns an empty object (i.e. no ttl)
      helpers.extractAttributes.mockReturnValue({});

      await updateLogsTTL(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({
        errors: [
          {
            error: 'Bad Request',
            message: 'invalid request'
          }
        ]
      });
    });

    it('should update logs TTL successfully when ttl is provided and setConfig returns valid result', async () => {
      const ttlValue = 3600;
      // Simulate extraction returning a valid ttl
      helpers.extractAttributes.mockReturnValue({ ttl: ttlValue });
      const result = { item: { ttl: ttlValue } };
      mockStorageConnection.setConfig.mockResolvedValue(result);
      // ensureLogsTTL resolves successfully
      mockStorageConnection.ensureLogsTTL.mockResolvedValue();

      await updateLogsTTL(req, res);

      // Verify that setConfig was called with the correct parameters
      expect(mockStorageConnection.setConfig).toHaveBeenCalledWith('logsTTL', ttlValue);
      // Verify that ensureLogsTTL was called
      expect(mockStorageConnection.ensureLogsTTL).toHaveBeenCalled();
      // Verify that the response is serialized correctly
      expect(Jsonapi.Serializer.serialize).toHaveBeenCalledWith(Jsonapi.LogType, result.item);
      expect(res.send).toHaveBeenCalledWith({ data: 'serialized data' });
    });

    it('should return 400 error when ttl is provided but setConfig returns an invalid result (empty object)', async () => {
      const ttlValue = 3600;
      helpers.extractAttributes.mockReturnValue({ ttl: ttlValue });
      // Simulate an invalid result from setConfig (no item property)
      const invalidResult = {};
      mockStorageConnection.setConfig.mockResolvedValue(invalidResult);

      await updateLogsTTL(req, res);

      expect(mockStorageConnection.setConfig).toHaveBeenCalledWith('logsTTL', ttlValue);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({
        errors: [
          {
            error: 'Bad Request',
            message: 'invalid request'
          }
        ]
      });
    });

    it('should return 400 error with error message when ttl is provided but setConfig returns invalid result with an error property', async () => {
      const ttlValue = 3600;
      helpers.extractAttributes.mockReturnValue({ ttl: ttlValue });
      // Simulate an invalid result with an error property
      const invalidResult = { error: 'Configuration update failed' };
      mockStorageConnection.setConfig.mockResolvedValue(invalidResult);

      await updateLogsTTL(req, res);

      expect(mockStorageConnection.setConfig).toHaveBeenCalledWith('logsTTL', ttlValue);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({
        errors: [
          {
            error: 'Bad Request',
            message: 'Configuration update failed'
          }
        ]
      });
    });

    it('should handle unexpected errors gracefully', async () => {
      const ttlValue = 3600;
      helpers.extractAttributes.mockReturnValue({ ttl: ttlValue });
      const error = new Error('Unexpected error');
      // Simulate setConfig throwing an error
      mockStorageConnection.setConfig.mockRejectedValue(error);

      await updateLogsTTL(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        errors: [
          {
            error: 'Internal Server Error',
            message: 'Unexpected error'
          }
        ]
      });
    });
  });

  describe('getLogMeta', () => {
    let req, res, storageConnectionMock;

    beforeEach(() => {
      req = { params: { logId: '123' } };
      res = {
        send: jest.fn(),
        status: jest.fn().mockReturnThis()
      };
      storageConnectionMock = {
        getMeta: jest.fn()
      };
      getStorageConnection.mockReturnValue(storageConnectionMock);
    });

    it('should return serialized log meta when logId is valid and meta exists', async () => {
      const mockMeta = { item: { id: '123', meta: 'someMeta' } };
      storageConnectionMock.getMeta.mockResolvedValue(mockMeta);

      await getLogMeta(req, res);

      expect(storageConnectionMock.getMeta).toHaveBeenCalledWith('123');
      expect(res.send).toHaveBeenCalledWith(Jsonapi.Serializer.serialize(Jsonapi.LogType, mockMeta.item));
    });

    it('should return 400 when logId is valid but meta does not exist', async () => {
      storageConnectionMock.getMeta.mockResolvedValue(null);

      await getLogMeta(req, res);

      expect(storageConnectionMock.getMeta).toHaveBeenCalledWith('123');
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({
        errors: [
          { error: 'Bad Request', message: 'invalid request' }
        ]
      });
    });

    it('should return 400 when logId is missing', async () => {
      req.params.logId = undefined;

      await getLogMeta(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({
        errors: [
          { error: 'Bad Request', message: 'invalid request' }
        ]
      });
    });

    it('should return 500 on storage connection error', async () => {
      const error = new Error('storage connection error');
      storageConnectionMock.getMeta.mockRejectedValue(error);

      await getLogMeta(req, res);

      expect(storageConnectionMock.getMeta).toHaveBeenCalledWith('123');
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        errors: [
          { error: 'Internal Server Error', message: 'storage connection error' }
        ]
      });
    });

    it('should handle specific error where getMeta is not a function', async () => {
      const error = new Error('storageConnection.getMeta is not a function');
      storageConnectionMock.getMeta.mockRejectedValue(error);

      await getLogMeta(req, res);

      expect(storageConnectionMock.getMeta).toHaveBeenCalledWith('123');
      expect(res.send).toHaveBeenCalledWith(Jsonapi.Serializer.serialize(Jsonapi.LogType, { id: '123', meta: '{}' }));
    });
  });

  describe('#getHostnames', () => {
    let req, res, mockStorageConnection;

    beforeEach(() => {
      req = {}; // No need for query parameters for this function
      res = {
        send: jest.fn(),
        status: jest.fn().mockReturnThis()
      };
      mockStorageConnection = {
        getHostnames: jest.fn()
      };
      getStorageConnection.mockReturnValue(mockStorageConnection);
    });

    it('should return hostnames when valid data is returned', async () => {
      const mockHostnames = { items: ['host1', 'host2', 'host3'] };
      mockStorageConnection.getHostnames.mockResolvedValue(mockHostnames);

      await getHostnames(req, res);

      expect(mockStorageConnection.getHostnames).toHaveBeenCalled();
      expect(res.send).toHaveBeenCalledWith(Jsonapi.Serializer.serialize(Jsonapi.LogType, { hostnames: ['host1', 'host2', 'host3'] }));
    });

    it('should return 400 when no hostnames are found', async () => {
      mockStorageConnection.getHostnames.mockResolvedValue({});

      await getHostnames(req, res);

      expect(mockStorageConnection.getHostnames).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({
        errors: [
          {
            error: 'Bad Request',
            message: 'invalid request'
          }
        ]
      });
    });

    it('should handle error when getHostnames is not a function', async () => {
      mockStorageConnection.getHostnames.mockRejectedValue(new Error('storageConnection.getHostnames is not a function'));

      await getHostnames(req, res);

      expect(mockStorageConnection.getHostnames).toHaveBeenCalled();
      expect(res.send).toHaveBeenCalledWith(Jsonapi.Serializer.serialize(Jsonapi.LogType, {}));
    });

    it('should handle unexpected errors gracefully', async () => {
      mockStorageConnection.getHostnames.mockRejectedValue(new Error('Unexpected error'));

      await getHostnames(req, res);

      expect(mockStorageConnection.getHostnames).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        errors: [
          {
            error: 'Internal Server Error',
            message: 'Unexpected error'
          }
        ]
      });
    });
  });

  describe('#deleteAllLogs', () => {
    let req, res, mockStorageConnection;

    beforeEach(() => {
      req = {}; // No request parameters needed
      res = {
        send: jest.fn(),
        status: jest.fn().mockReturnThis()
      };
      mockStorageConnection = {
        deleteAllLogs: jest.fn()
      };
      getStorageConnection.mockReturnValue(mockStorageConnection);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should delete all logs successfully and send success message', async () => {
      // Simulate successful deletion
      mockStorageConnection.deleteAllLogs.mockResolvedValue();

      await deleteAllLogs(req, res);

      expect(mockStorageConnection.deleteAllLogs).toHaveBeenCalled();
      expect(res.send).toHaveBeenCalledWith({
        message: 'All logs have been successfully deleted.'
      });
    });

    it('should handle errors and send error response when deletion fails', async () => {
      // Simulate an error thrown by deleteAllLogs
      const error = new Error('Deletion error');
      mockStorageConnection.deleteAllLogs.mockRejectedValue(error);

      await deleteAllLogs(req, res);

      expect(mockStorageConnection.deleteAllLogs).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        errors: [
          {
            error: 'Internal Server Error',
            message: 'Deletion error'
          }
        ]
      });
    });

    it('should handle errors with no message and send default error message', async () => {
      // Simulate an error with no message property
      const error = {}; // error.message is undefined
      mockStorageConnection.deleteAllLogs.mockRejectedValue(error);

      await deleteAllLogs(req, res);

      expect(mockStorageConnection.deleteAllLogs).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        errors: [
          {
            error: 'Internal Server Error',
            message: 'An unexpected error occurred while deleting logs.'
          }
        ]
      });
    });
  });
});
