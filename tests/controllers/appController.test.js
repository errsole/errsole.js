
const { checkUpdates, getSlackDetails, addSlackDetails, updateSlackDetails, deleteSlackDetails, getEmailDetails, addEmailDetails, updateEmailDetails, deleteEmailDetails, testEmailNotification, testSlackNotification } = require('../../lib/main/server/controllers/appController');
const NPMUpdates = require('../../lib/main/server/utils/npmUpdates');
const helpers = require('../../lib/main/server/utils/helpers');
const { getStorageConnection } = require('../../lib/main/server/storageConnection');
const Jsonapi = require('../../lib/main/server/utils/jsonapiUtil');
const packageJson = require('../../package.json');
const Alerts = require('../../lib/main/server/utils/alerts');
const { describe } = require('@jest/globals');

/* globals expect, jest, beforeEach, afterAll, beforeAll, it, afterEach */
jest.mock('../../lib/main/server/utils/npmUpdates');
jest.mock('../../lib/main/server/storageConnection');
jest.mock('../../lib/main/server/utils/jsonapiUtil');
jest.mock('../../lib/main/server/utils/helpers');
jest.mock('../../lib/main/server/utils/alerts');

describe('appController', () => {
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
  describe('#checkUpdates', () => {
    it('should return the correct data when successfully fetching the latest version of "errsole"', async () => {
      const req = {};
      const res = {
        send: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      const mockErrsoleVersion = '1.2.3';
      const mockStorageVersion = '4.5.6';
      const mockStorageConnection = { name: 'mockStorage', version: '4.0.0' };

      NPMUpdates.fetchLatestVersion
        .mockResolvedValueOnce(mockErrsoleVersion)
        .mockResolvedValueOnce(mockStorageVersion);

      getStorageConnection.mockReturnValue(mockStorageConnection);
      Jsonapi.Serializer.serialize.mockReturnValue({
        data: {
          attributes: {
            name: 'testApp',
            version: '1.0.0',
            latest_version: mockErrsoleVersion,
            storage_name: mockStorageConnection.name,
            storage_version: mockStorageConnection.version,
            storage_latest_version: mockStorageVersion
          }
        }
      });

      await checkUpdates(req, res);

      expect(NPMUpdates.fetchLatestVersion).toHaveBeenCalledWith('errsole');
      expect(NPMUpdates.fetchLatestVersion).toHaveBeenCalledWith(mockStorageConnection.name);
      expect(getStorageConnection).toHaveBeenCalled();
      expect(Jsonapi.Serializer.serialize).toHaveBeenCalledWith(Jsonapi.AppType, {
        name: packageJson.name,
        version: packageJson.version,
        latest_version: mockErrsoleVersion,
        storage_name: mockStorageConnection.name,
        storage_version: mockStorageConnection.version,
        storage_latest_version: mockStorageVersion
      });
      expect(res.send).toHaveBeenCalledWith({
        data: {
          attributes: {
            name: 'testApp',
            version: '1.0.0',
            latest_version: '1.2.3',
            storage_name: 'mockStorage',
            storage_version: '4.0.0',
            storage_latest_version: '4.5.6'
          }
        }
      });
    });
    it('should handle errors when fetching the latest version for errsole', async () => {
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      NPMUpdates.fetchLatestVersion.mockRejectedValueOnce(new Error('Error fetching version'));

      await checkUpdates(req, res);

      expect(NPMUpdates.fetchLatestVersion).toHaveBeenCalledWith('errsole');
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        errors: [
          {
            error: 'Internal Server Error',
            message: 'An unexpected error occurred'
          }
        ]
      });
    });

    it('should handle errors when fetching the latest version for the storage connection', async () => {
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      NPMUpdates.fetchLatestVersion.mockResolvedValueOnce('1.0.1').mockRejectedValueOnce(new Error('Error fetching version'));
      const mockStorageConnection = {
        name: 'mockStorage',
        version: '1.0.0'
      };
      getStorageConnection.mockReturnValue(mockStorageConnection);

      await checkUpdates(req, res);

      expect(NPMUpdates.fetchLatestVersion).toHaveBeenCalledWith('errsole');
      expect(NPMUpdates.fetchLatestVersion).toHaveBeenCalledWith('mockStorage');
      expect(getStorageConnection).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        errors: [
          {
            error: 'Internal Server Error',
            message: 'An unexpected error occurred'
          }
        ]
      });
    });

    it('should handle errors when getting the storage connection', async () => {
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      getStorageConnection.mockImplementation(() => { throw new Error('Error getting storage connection'); });

      await checkUpdates(req, res);

      expect(getStorageConnection).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        errors: [
          {
            error: 'Internal Server Error',
            message: 'An unexpected error occurred'
          }
        ]
      });
    });
  });
  describe('#getSlackDetails', () => {
    it('should successfully retrieve Slack details with a valid config', async () => {
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      const mockSlackConfig = {
        item: {
          value: JSON.stringify({ url: 'https://slack.com/webhook', username: 'test', channel: 'general' })
        }
      };

      const mockStorageConnection = {
        getConfig: jest.fn().mockResolvedValue(mockSlackConfig)
      };

      getStorageConnection.mockReturnValue(mockStorageConnection);
      Jsonapi.Serializer.serialize.mockReturnValue({ data: { value: { username: 'test', channel: 'general' } } });

      await getSlackDetails(req, res);

      expect(mockStorageConnection.getConfig).toHaveBeenCalledWith('slackIntegration');
      expect(Jsonapi.Serializer.serialize).toHaveBeenCalledWith(Jsonapi.AppType, { value: { username: 'test', channel: 'general' } });
      expect(res.send).toHaveBeenCalledWith({ data: { value: { username: 'test', channel: 'general' } } });
    });

    it('should handle internal server errors', async () => {
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      const mockStorageConnection = {
        getConfig: jest.fn().mockRejectedValue(new Error('Internal error'))
      };

      getStorageConnection.mockReturnValue(mockStorageConnection);

      await getSlackDetails(req, res);

      expect(mockStorageConnection.getConfig).toHaveBeenCalledWith('slackIntegration');
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        errors: [
          {
            error: 'Internal Server Error',
            message: 'An unexpected error occurred'
          }
        ]
      });
    });
  });

  describe('#addSlackDetails', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return a conflict error when an invalid Slack URL is provided', async () => {
      const req = {
        body: {
          data: {
            attributes: {
              url: 'https://invalid-url.com'
            }
          }
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      helpers.extractAttributes.mockReturnValue({ url: 'https://invalid-url.com' });
      helpers.SlackUrl.mockResolvedValue(false);

      await addSlackDetails(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.send).toHaveBeenCalledWith({
        errors: [
          {
            error: 'Conflict',
            message: 'You have sent a url which is not a slack url.'
          }
        ]
      });
    });

    it('should return a conflict error when a Slack URL already exists', async () => {
      const req = {
        body: {
          data: {
            attributes: {
              url: 'https://slack.com/webhook'
            }
          }
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      helpers.extractAttributes.mockReturnValue({ url: 'https://slack.com/webhook' });
      helpers.SlackUrl.mockResolvedValue(true);

      const mockStorageConnection = {
        getConfig: jest.fn().mockResolvedValue({ item: { value: '{}' } })
      };
      getStorageConnection.mockReturnValue(mockStorageConnection);

      await addSlackDetails(req, res);

      expect(mockStorageConnection.getConfig).toHaveBeenCalledWith('slackIntegration');
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.send).toHaveBeenCalledWith({
        errors: [
          {
            error: 'Conflict',
            message: 'You have already added a webhook url for slack.'
          }
        ]
      });
    });

    it('should add a valid Slack URL to the configuration when provided', async () => {
      const req = {
        body: {
          data: {
            attributes: {
              url: 'https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX'
            }
          }
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };
      const mockStorageConnection = {
        getConfig: jest.fn().mockResolvedValue({ item: null }),
        setConfig: jest.fn().mockResolvedValue({ item: { value: JSON.stringify({ url: 'https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX', username: 'Errsole', icon_url: 'https://avatars.githubusercontent.com/u/84983840', status: true }) } })
      };
      getStorageConnection.mockReturnValue(mockStorageConnection);
      helpers.extractAttributes.mockReturnValue({ url: 'https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX' });
      await addSlackDetails(req, res);
      expect(res.send).toHaveBeenCalledWith(Jsonapi.Serializer.serialize(Jsonapi.AppType, { value: { url: 'https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX', username: 'Errsole', icon_url: 'https://avatars.githubusercontent.com/u/84983840', status: true } }));
    });

    it('should handle storage connection error when checking existing config', async () => {
      const req = {
        body: {
          data: {
            attributes: {
              url: 'https://slack.com/webhook'
            }
          }
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      helpers.extractAttributes.mockReturnValue({ url: 'https://slack.com/webhook' });
      helpers.SlackUrl.mockResolvedValue(true);

      const mockStorageConnection = {
        getConfig: jest.fn().mockRejectedValue(new Error('Internal error'))
      };
      getStorageConnection.mockReturnValue(mockStorageConnection);

      await addSlackDetails(req, res);

      expect(mockStorageConnection.getConfig).toHaveBeenCalledWith('slackIntegration');
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        errors: [
          {
            error: 'Internal Server Error',
            message: 'An unexpected error occurred'
          }
        ]
      });
    });

    it('should handle unexpected errors', async () => {
      const req = {
        body: {
          data: {
            attributes: {
              url: 'https://slack.com/webhook'
            }
          }
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      helpers.extractAttributes.mockReturnValue({ url: 'https://slack.com/webhook' });
      helpers.SlackUrl.mockImplementation(() => { throw new Error('Unexpected error'); });

      await addSlackDetails(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        errors: [
          {
            error: 'Internal Server Error',
            message: 'An unexpected error occurred'
          }
        ]
      });
    });
  });

  describe('#updateSlackDetails', () => {
    it('should successfully update the Slack details', async () => {
      const req = {
        body: {
          data: {
            attributes: {
              status: true
            }
          }
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      const mockSlackConfig = {
        item: {
          value: JSON.stringify({
            url: 'https://slack.com/webhook',
            username: 'test',
            channel: 'general',
            status: false
          })
        }
      };

      const mockStorageConnection = {
        getConfig: jest.fn().mockResolvedValue(mockSlackConfig),
        setConfig: jest.fn().mockResolvedValue({
          item: {
            value: JSON.stringify({
              url: 'https://slack.com/webhook',
              username: 'test',
              channel: 'general',
              status: true
            })
          }
        })
      };

      getStorageConnection.mockReturnValue(mockStorageConnection);
      helpers.extractAttributes.mockReturnValue({ status: true });
      Jsonapi.Serializer.serialize.mockReturnValue({ data: { value: { status: true } } });

      await updateSlackDetails(req, res);

      expect(mockStorageConnection.getConfig).toHaveBeenCalledWith('slackIntegration');
      expect(mockStorageConnection.setConfig).toHaveBeenCalledWith(
        'slackIntegration',
        JSON.stringify({
          url: 'https://slack.com/webhook',
          username: 'test',
          channel: 'general',
          status: true
        })
      );
      expect(Jsonapi.Serializer.serialize).toHaveBeenCalledWith(Jsonapi.AppType, expect.any(Object));
      expect(res.send).toHaveBeenCalledWith({ data: { value: { status: true } } });
    });

    it('should return an internal server error when Slack configuration does not exist', async () => {
      const req = {
        body: {
          data: {
            attributes: {
              status: true
            }
          }
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      const mockStorageConnection = {
        getConfig: jest.fn().mockResolvedValue(null)
      };

      getStorageConnection.mockReturnValue(mockStorageConnection);
      helpers.extractAttributes.mockReturnValue({ status: true });

      await updateSlackDetails(req, res);

      expect(mockStorageConnection.getConfig).toHaveBeenCalledWith('slackIntegration');
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        errors: [
          {
            error: 'Internal Server Error',
            message: 'An unexpected error occurred'
          }
        ]
      });
    });

    it('should return an internal server error when Slack configuration JSON is invalid', async () => {
      const req = {
        body: {
          data: {
            attributes: {
              status: true
            }
          }
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      const mockSlackConfig = {
        item: {
          value: 'invalid json'
        }
      };

      const mockStorageConnection = {
        getConfig: jest.fn().mockResolvedValue(mockSlackConfig)
      };

      getStorageConnection.mockReturnValue(mockStorageConnection);
      helpers.extractAttributes.mockReturnValue({ status: true });

      await updateSlackDetails(req, res);

      expect(mockStorageConnection.getConfig).toHaveBeenCalledWith('slackIntegration');
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        errors: [
          {
            error: 'Internal Server Error',
            message: 'An unexpected error occurred'
          }
        ]
      });
    });

    it('should handle error during configuration retrieval', async () => {
      const req = {
        body: {
          data: {
            attributes: {
              status: true
            }
          }
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      const mockStorageConnection = {
        getConfig: jest.fn().mockRejectedValue(new Error('Internal error'))
      };

      getStorageConnection.mockReturnValue(mockStorageConnection);
      helpers.extractAttributes.mockReturnValue({ status: true });

      await updateSlackDetails(req, res);

      expect(mockStorageConnection.getConfig).toHaveBeenCalledWith('slackIntegration');
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        errors: [
          {
            error: 'Internal Server Error',
            message: 'An unexpected error occurred'
          }
        ]
      });
    });
    it('should handle error during configuration update', async () => {
      const req = {
        body: {
          data: {
            attributes: {
              status: true
            }
          }
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      const mockSlackConfig = {
        item: {
          value: JSON.stringify({
            url: 'https://slack.com/webhook',
            username: 'test',
            channel: 'general',
            status: false
          })
        }
      };

      const mockStorageConnection = {
        getConfig: jest.fn().mockResolvedValue(mockSlackConfig),
        setConfig: jest.fn().mockRejectedValue(new Error('Internal error'))
      };

      getStorageConnection.mockReturnValue(mockStorageConnection);
      helpers.extractAttributes.mockReturnValue({ status: true });

      await updateSlackDetails(req, res);

      expect(mockStorageConnection.getConfig).toHaveBeenCalledWith('slackIntegration');
      expect(mockStorageConnection.setConfig).toHaveBeenCalledWith(
        'slackIntegration',
        JSON.stringify({
          url: 'https://slack.com/webhook',
          username: 'test',
          channel: 'general',
          status: true
        })
      );
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        errors: [
          {
            error: 'Internal Server Error',
            message: 'An unexpected error occurred'
          }
        ]
      });
    });

    it('should handle unexpected errors', async () => {
      const req = {
        body: {
          data: {
            attributes: {
              status: true
            }
          }
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      getStorageConnection.mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      helpers.extractAttributes.mockReturnValue({ status: true });

      await updateSlackDetails(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        errors: [
          {
            error: 'Internal Server Error',
            message: 'An unexpected error occurred'
          }
        ]
      });
    });
  });

  describe('#deleteSlackDetails', () => {
    it('should successfully delete the Slack details', async () => {
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      const mockStorageConnection = {
        deleteConfig: jest.fn().mockResolvedValue(true)
      };

      getStorageConnection.mockReturnValue(mockStorageConnection);
      Jsonapi.Serializer.serialize.mockReturnValue({
        data: 'slack integration has been removed'
      });

      await deleteSlackDetails(req, res);

      expect(mockStorageConnection.deleteConfig).toHaveBeenCalledWith('slackIntegration');
      expect(Jsonapi.Serializer.serialize).toHaveBeenCalledWith(Jsonapi.AppType, {
        data: 'slack integration has been removed'
      });
      expect(res.send).toHaveBeenCalledWith({
        data: 'slack integration has been removed'
      });
    });

    it('should return an internal server error when deletion of Slack configuration fails', async () => {
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      const mockStorageConnection = {
        deleteConfig: jest.fn().mockResolvedValue(null)
      };

      getStorageConnection.mockReturnValue(mockStorageConnection);

      await deleteSlackDetails(req, res);

      expect(mockStorageConnection.deleteConfig).toHaveBeenCalledWith('slackIntegration');
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        errors: [
          {
            error: 'Internal Server Error',
            message: 'An unexpected error occurred'
          }
        ]
      });
    });

    it('should handle error during deletion of Slack configuration', async () => {
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      const mockStorageConnection = {
        deleteConfig: jest.fn().mockRejectedValue(new Error('Internal error'))
      };

      getStorageConnection.mockReturnValue(mockStorageConnection);

      await deleteSlackDetails(req, res);

      expect(mockStorageConnection.deleteConfig).toHaveBeenCalledWith('slackIntegration');
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        errors: [
          {
            error: 'Internal Server Error',
            message: 'An unexpected error occurred'
          }
        ]
      });
    });

    it('should handle unexpected errors', async () => {
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      getStorageConnection.mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      await deleteSlackDetails(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        errors: [
          {
            error: 'Internal Server Error',
            message: 'An unexpected error occurred'
          }
        ]
      });
    });
  });
  describe('#addEmailDetails', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should successfully add email details', async () => {
      const req = {
        body: {
          data: {
            attributes: {
              sender: 'no-reply@example.com',
              host: 'smtp.example.com',
              port: 587,
              username: 'user@example.com',
              password: 'password',
              receivers: ['receiver1@example.com', 'receiver2@example.com']
            }
          }
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      const mockEmailDetails = {
        sender: 'no-reply@example.com',
        host: 'smtp.example.com',
        port: 587,
        username: 'user@example.com',
        password: 'password',
        receivers: ['receiver1@example.com', 'receiver2@example.com'],
        status: true
      };

      const mockStorageConnection = {
        setConfig: jest.fn().mockResolvedValue({
          item: {
            value: JSON.stringify(mockEmailDetails)
          }
        })
      };

      getStorageConnection.mockReturnValue(mockStorageConnection);
      helpers.extractAttributes.mockReturnValue(mockEmailDetails);
      Jsonapi.Serializer.serialize.mockReturnValue({
        data: {
          value: mockEmailDetails
        }
      });

      await addEmailDetails(req, res);

      expect(mockStorageConnection.setConfig).toHaveBeenCalledWith(
        'emailIntegration',
        JSON.stringify(mockEmailDetails)
      );
      expect(Jsonapi.Serializer.serialize).toHaveBeenCalledWith(Jsonapi.AppType, {
        value: mockEmailDetails
      });
      expect(res.send).toHaveBeenCalledWith({
        data: {
          value: mockEmailDetails
        }
      });
    });

    it('should return an internal server error when adding email configuration fails', async () => {
      const req = {
        body: {
          data: {
            attributes: {
              sender: 'no-reply@example.com',
              host: 'smtp.example.com',
              port: 587,
              username: 'user@example.com',
              password: 'password',
              receivers: ['receiver1@example.com', 'receiver2@example.com']
            }
          }
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      const mockEmailDetails = {
        sender: 'no-reply@example.com',
        host: 'smtp.example.com',
        port: 587,
        username: 'user@example.com',
        password: 'password',
        receivers: ['receiver1@example.com', 'receiver2@example.com'],
        status: true
      };

      const mockStorageConnection = {
        setConfig: jest.fn().mockResolvedValue(null)
      };

      getStorageConnection.mockReturnValue(mockStorageConnection);
      helpers.extractAttributes.mockReturnValue(mockEmailDetails);

      await addEmailDetails(req, res);

      expect(mockStorageConnection.setConfig).toHaveBeenCalledWith(
        'emailIntegration',
        JSON.stringify(mockEmailDetails)
      );
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        errors: [
          {
            error: 'Internal Server Error',
            message: 'An unexpected error occurred'
          }
        ]
      });
    });

    it('should handle error during configuration update', async () => {
      const req = {
        body: {
          data: {
            attributes: {
              sender: 'no-reply@example.com',
              host: 'smtp.example.com',
              port: 587,
              username: 'user@example.com',
              password: 'password',
              receivers: ['receiver1@example.com', 'receiver2@example.com']
            }
          }
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      const mockEmailDetails = {
        sender: 'no-reply@example.com',
        host: 'smtp.example.com',
        port: 587,
        username: 'user@example.com',
        password: 'password',
        receivers: ['receiver1@example.com', 'receiver2@example.com'],
        status: true
      };

      const mockStorageConnection = {
        setConfig: jest.fn().mockRejectedValue(new Error('Internal error'))
      };

      getStorageConnection.mockReturnValue(mockStorageConnection);
      helpers.extractAttributes.mockReturnValue(mockEmailDetails);

      await addEmailDetails(req, res);

      expect(mockStorageConnection.setConfig).toHaveBeenCalledWith(
        'emailIntegration',
        JSON.stringify(mockEmailDetails)
      );
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        errors: [
          {
            error: 'Internal Server Error',
            message: 'An unexpected error occurred'
          }
        ]
      });
    });

    it('should handle unexpected errors', async () => {
      const req = {
        body: {
          data: {
            attributes: {
              sender: 'no-reply@example.com',
              host: 'smtp.example.com',
              port: 587,
              username: 'user@example.com',
              password: 'password',
              receivers: ['receiver1@example.com', 'receiver2@example.com']
            }
          }
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      getStorageConnection.mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      helpers.extractAttributes.mockReturnValue({
        sender: 'no-reply@example.com',
        host: 'smtp.example.com',
        port: 587,
        username: 'user@example.com',
        password: 'password',
        receivers: ['receiver1@example.com', 'receiver2@example.com']
      });

      await addEmailDetails(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        errors: [
          {
            error: 'Internal Server Error',
            message: 'An unexpected error occurred'
          }
        ]
      });
    });

    describe('#getEmailDetails', () => {
      let req, res, storageConnection, getConfigMock;

      beforeEach(() => {
        req = {};
        res = {
          send: jest.fn(),
          status: jest.fn().mockReturnThis()
        };
        storageConnection = {
          getConfig: jest.fn()
        };
        getConfigMock = storageConnection.getConfig;
        getStorageConnection.mockReturnValue(storageConnection);
      });

      afterEach(() => {
        jest.clearAllMocks();
      });

      it('should retrieve email integration details and remove the URL', async () => {
        const mockData = {
          item: {
            value: JSON.stringify({ url: 'http://example.com', otherKey: 'value' })
          }
        };
        getConfigMock.mockResolvedValue(mockData);

        await getEmailDetails(req, res);

        expect(getConfigMock).toHaveBeenCalledWith('emailIntegration');
        expect(res.send).toHaveBeenCalledWith(Jsonapi.Serializer.serialize(Jsonapi.AppType, { otherKey: 'value' }));
      });

      it('should handle value without URL', async () => {
        const mockData = {
          item: {
            value: JSON.stringify({ otherKey: 'value' })
          }
        };
        getConfigMock.mockResolvedValue(mockData);

        await getEmailDetails(req, res);

        expect(getConfigMock).toHaveBeenCalledWith('emailIntegration');
        expect(res.send).toHaveBeenCalledWith(Jsonapi.Serializer.serialize(Jsonapi.AppType, { otherKey: 'value' }));
      });

      it('should return an empty object if data has no item', async () => {
        getConfigMock.mockResolvedValue({});

        await getEmailDetails(req, res);

        expect(getConfigMock).toHaveBeenCalledWith('emailIntegration');
        expect(res.send).toHaveBeenCalledWith(Jsonapi.Serializer.serialize(Jsonapi.AppType, {}));
      });

      it('should handle and log errors, and respond with a 500 status code', async () => {
        const error = new Error('Something went wrong');
        getConfigMock.mockRejectedValue(error);

        await getEmailDetails(req, res);

        expect(console.error).toHaveBeenCalledWith(error);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith({
          errors: [
            {
              error: 'Internal Server Error',
              message: 'An unexpected error occurred'
            }
          ]
        });
      });

      it('should handle invalid JSON in value', async () => {
        const mockData = {
          item: {
            value: '{ invalid JSON }'
          }
        };
        getConfigMock.mockResolvedValue(mockData);

        await getEmailDetails(req, res);

        expect(console.error).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith({
          errors: [
            {
              error: 'Internal Server Error',
              message: 'An unexpected error occurred'
            }
          ]
        });
      });

      it('should handle incomplete value object', async () => {
        const mockData = {
          item: {
            value: JSON.stringify({ partialKey: 'value' })
          }
        };
        getConfigMock.mockResolvedValue(mockData);

        await getEmailDetails(req, res);

        expect(getConfigMock).toHaveBeenCalledWith('emailIntegration');
        expect(res.send).toHaveBeenCalledWith(Jsonapi.Serializer.serialize(Jsonapi.AppType, { partialKey: 'value' }));
      });
    });
  });

  describe('#updateEmailDetails', () => {
    let req, res, storageConnection, getConfigMock, setConfigMock, extractAttributesMock;

    beforeEach(() => {
      req = {
        body: {}
      };
      res = {
        send: jest.fn(),
        status: jest.fn().mockReturnThis()
      };
      storageConnection = {
        getConfig: jest.fn(),
        setConfig: jest.fn()
      };
      getConfigMock = storageConnection.getConfig;
      setConfigMock = storageConnection.setConfig;
      getStorageConnection.mockReturnValue(storageConnection);
      extractAttributesMock = helpers.extractAttributes;
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should update email integration status successfully', async () => {
      req.body = { status: true };
      const mockData = {
        item: {
          value: JSON.stringify({ status: false })
        }
      };
      const mockResult = {
        item: {
          value: JSON.stringify({ status: true })
        }
      };
      extractAttributesMock.mockReturnValue({ status: true });
      getConfigMock.mockResolvedValue(mockData);
      setConfigMock.mockResolvedValue(mockResult);

      await updateEmailDetails(req, res);

      expect(getConfigMock).toHaveBeenCalledWith('emailIntegration');
      expect(setConfigMock).toHaveBeenCalledWith(
        'emailIntegration',
        JSON.stringify({ status: true })
      );
      expect(res.send).toHaveBeenCalledWith(Jsonapi.Serializer.serialize(Jsonapi.AppType, { status: true }));
    });

    it('should handle JSON parsing error', async () => {
      req.body = { status: true };
      const mockData = {
        item: {
          value: '{ invalid JSON }'
        }
      };
      extractAttributesMock.mockReturnValue({ status: true });
      getConfigMock.mockResolvedValue(mockData);

      await updateEmailDetails(req, res);

      expect(getConfigMock).toHaveBeenCalledWith('emailIntegration');
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        errors: [
          {
            error: 'Internal Server Error',
            message: 'An unexpected error occurred'
          }
        ]
      });
    });

    it('should handle no data found', async () => {
      req.body = { status: true };
      extractAttributesMock.mockReturnValue({ status: true });
      getConfigMock.mockResolvedValue(null);

      await updateEmailDetails(req, res);

      expect(getConfigMock).toHaveBeenCalledWith('emailIntegration');
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        errors: [
          {
            error: 'Internal Server Error',
            message: 'An unexpected error occurred'
          }
        ]
      });
    });

    it('should handle setConfig error', async () => {
      req.body = { status: true };
      const mockData = {
        item: {
          value: JSON.stringify({ status: false })
        }
      };
      extractAttributesMock.mockReturnValue({ status: true });
      getConfigMock.mockResolvedValue(mockData);
      setConfigMock.mockResolvedValue(null);

      await updateEmailDetails(req, res);

      expect(getConfigMock).toHaveBeenCalledWith('emailIntegration');
      expect(setConfigMock).toHaveBeenCalledWith(
        'emailIntegration',
        JSON.stringify({ status: true })
      );
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        errors: [
          {
            error: 'Internal Server Error',
            message: 'An unexpected error occurred'
          }
        ]
      });
    });

    it('should handle unexpected errors', async () => {
      const error = new Error('Something went wrong');
      getConfigMock.mockRejectedValue(error);

      await updateEmailDetails(req, res);

      expect(console.error).toHaveBeenCalledWith(error);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        errors: [
          {
            error: 'Internal Server Error',
            message: 'An unexpected error occurred'
          }
        ]
      });
    });
  });

  describe('#deleteEmailDetails', () => {
    let req, res, storageConnection, deleteConfigMock, extractAttributesMock;

    beforeEach(() => {
      req = {
        body: {}
      };
      res = {
        send: jest.fn(),
        status: jest.fn().mockReturnThis()
      };
      storageConnection = {
        deleteConfig: jest.fn()
      };
      deleteConfigMock = storageConnection.deleteConfig;
      getStorageConnection.mockReturnValue(storageConnection);
      extractAttributesMock = helpers.extractAttributes;
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should delete email integration details successfully', async () => {
      req.body = { url: 'http://example.com' };
      const mockData = true;
      extractAttributesMock.mockReturnValue({ url: 'http://example.com' });
      deleteConfigMock.mockResolvedValue(mockData);

      await deleteEmailDetails(req, res);

      expect(extractAttributesMock).toHaveBeenCalledWith(req.body);
      expect(deleteConfigMock).toHaveBeenCalledWith('emailIntegration');
      expect(res.send).toHaveBeenCalledWith(Jsonapi.Serializer.serialize(Jsonapi.AppType, { url: 'http://example.com' }));
    });

    it('should handle no data found after deletion', async () => {
      req.body = { url: 'http://example.com' };
      extractAttributesMock.mockReturnValue({ url: 'http://example.com' });
      deleteConfigMock.mockResolvedValue(false);

      await deleteEmailDetails(req, res);

      expect(extractAttributesMock).toHaveBeenCalledWith(req.body);
      expect(deleteConfigMock).toHaveBeenCalledWith('emailIntegration');
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        errors: [
          {
            error: 'Internal Server Error',
            message: 'An unexpected error occurred'
          }
        ]
      });
    });

    it('should handle unexpected errors', async () => {
      const error = new Error('Something went wrong');
      req.body = { url: 'http://example.com' };
      extractAttributesMock.mockReturnValue({ url: 'http://example.com' });
      deleteConfigMock.mockRejectedValue(error);

      await deleteEmailDetails(req, res);

      expect(extractAttributesMock).toHaveBeenCalledWith(req.body);
      expect(deleteConfigMock).toHaveBeenCalledWith('emailIntegration');
      expect(console.error).toHaveBeenCalledWith(error);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        errors: [
          {
            error: 'Internal Server Error',
            message: 'An unexpected error occurred'
          }
        ]
      });
    });
  });

  describe('#testSlackNotification', () => {
    it('should send a test Slack notification successfully', async () => {
      const req = {};
      const res = {
        send: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      Alerts.testSlackAlert.mockResolvedValue(true);
      Jsonapi.Serializer.serialize.mockReturnValue({ success: true });

      await testSlackNotification(req, res);

      expect(Alerts.testSlackAlert).toHaveBeenCalledWith('Hello, This is a test notification.', 'Test');
      expect(Jsonapi.Serializer.serialize).toHaveBeenCalledWith(Jsonapi.AppType, { success: true });
      expect(res.send).toHaveBeenCalledWith({ success: true });
    });

    it('should handle errors and respond with a 500 status code', async () => {
      const req = {};
      const res = {
        send: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      const error = new Error('Test error');
      Alerts.testSlackAlert.mockRejectedValue(error);

      await testSlackNotification(req, res);

      expect(console.error).toHaveBeenCalledWith(error);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        errors: [
          {
            error: 'Internal Server Error',
            message: 'An unexpected error occurred'
          }
        ]
      });
    });
  });

  describe('#testEmailNotification', () => {
    it('should send a test email notification successfully', async () => {
      const req = {};
      const res = {
        send: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      Alerts.testEmailAlert.mockResolvedValue(true);
      Jsonapi.Serializer.serialize.mockReturnValue({ success: true });

      await testEmailNotification(req, res);

      expect(Alerts.testEmailAlert).toHaveBeenCalledWith('Hello, This is a test notification.', 'Test');
      expect(Jsonapi.Serializer.serialize).toHaveBeenCalledWith(Jsonapi.AppType, { success: true });
      expect(res.send).toHaveBeenCalledWith({ success: true });
    });

    it('should handle errors and respond with a 500 status code', async () => {
      const req = {};
      const res = {
        send: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      const error = new Error('Test error');
      Alerts.testEmailAlert.mockRejectedValue(error);

      await testEmailNotification(req, res);

      expect(console.error).toHaveBeenCalledWith(error);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        errors: [
          {
            error: 'Internal Server Error',
            message: 'An unexpected error occurred'
          }
        ]
      });
    });
  });
});
