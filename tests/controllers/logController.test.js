const { getLogs, getLogsTTL, updateLogsTTL, getLogMeta, getHostnames, deleteAllLogs } = require('../../lib/main/server/controllers/logController');
const Jsonapi = require('../../lib/main/server/utils/jsonapiUtil');
const { getStorageConnection } = require('../../lib/main/server/storageConnection');
const { describe, it } = require('@jest/globals');
const helpers = require('../../lib/main/server/utils/helpers');
/* globals expect, jest, beforeEach, beforeAll, afterAll */

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
            message: 'Unexpected token i in JSON at position 0'
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
            message: 'Unexpected token i in JSON at position 0'
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
  });

  describe('#updateLogsTTL', () => {
    let req, res, mockStorageConnection;

    beforeEach(() => {
      req = {
        body: {
          data: {
            attributes: {
              ttl: 30
            }
          }
        }
      };
      res = {
        send: jest.fn(),
        status: jest.fn().mockReturnThis()
      };
      mockStorageConnection = {
        setConfig: jest.fn(),
        ensureLogsTTL: jest.fn()
      };
      getStorageConnection.mockReturnValue(mockStorageConnection);
      Jsonapi.Serializer.serialize.mockImplementation((type, item) => ({ data: { type, item } }));
      helpers.extractAttributes.mockReturnValue({ ttl: 30 });
    });

    it('should update logs TTL successfully', async () => {
      const mockResult = { item: { id: 1, ttl: 30 } };
      mockStorageConnection.setConfig.mockResolvedValue(mockResult);
      mockStorageConnection.ensureLogsTTL.mockResolvedValue(null);

      await updateLogsTTL(req, res);

      expect(mockStorageConnection.setConfig).toHaveBeenCalledWith('logsTTL', 30);
      expect(mockStorageConnection.ensureLogsTTL).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalledWith(400);
      expect(res.status).not.toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith(Jsonapi.Serializer.serialize(Jsonapi.LogType, { id: 1, ttl: 30 }));
    });

    it('should return 400 if TTL is not provided', async () => {
      helpers.extractAttributes.mockReturnValue({});
      req.body.data.attributes = {};

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

    it('should return 400 if setConfig result does not contain item', async () => {
      const mockResult = {};
      mockStorageConnection.setConfig.mockResolvedValue(mockResult);

      await updateLogsTTL(req, res);

      expect(mockStorageConnection.setConfig).toHaveBeenCalledWith('logsTTL', 30);
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

    it('should handle errors gracefully', async () => {
      mockStorageConnection.setConfig.mockRejectedValue(new Error('Unexpected error'));

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

    it('should handle errors from ensureLogsTTL gracefully', async () => {
      const mockResult = { item: { id: 1, ttl: 30 } };
      mockStorageConnection.setConfig.mockResolvedValue(mockResult);
      mockStorageConnection.ensureLogsTTL.mockRejectedValue(new Error('Ensure TTL error'));

      await updateLogsTTL(req, res);

      expect(mockStorageConnection.setConfig).toHaveBeenCalledWith('logsTTL', 30);
      expect(mockStorageConnection.ensureLogsTTL).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        errors: [
          {
            error: 'Internal Server Error',
            message: 'Ensure TTL error'
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
      req = {}; // No body or query needed for this function
      res = {
        send: jest.fn(),
        status: jest.fn().mockReturnThis()
      };
      mockStorageConnection = {
        deleteAllLogs: jest.fn()
      };
      getStorageConnection.mockReturnValue(mockStorageConnection);
    });

    it('should delete all logs and return success message', async () => {
      mockStorageConnection.deleteAllLogs.mockResolvedValue(null);

      await deleteAllLogs(req, res);

      expect(mockStorageConnection.deleteAllLogs).toHaveBeenCalled();
      expect(res.send).toHaveBeenCalledWith({
        message: 'All logs have been successfully deleted.'
      });
    });

    it('should handle errors gracefully', async () => {
      const errorMessage = 'Database connection error';
      mockStorageConnection.deleteAllLogs.mockRejectedValue(new Error(errorMessage));

      await deleteAllLogs(req, res);

      expect(mockStorageConnection.deleteAllLogs).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        errors: [
          {
            error: 'Internal Server Error',
            message: errorMessage
          }
        ]
      });
    });
  });
});
