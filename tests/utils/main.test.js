const { SlackService, EmailService } = require('../../lib/main/server/utils/alerts');
const axios = require('axios');
const nodemailer = require('nodemailer');
const { getStorageConnection } = require('../../lib/main/server/storageConnection');
/* globals expect, jest, beforeEach, describe, it */
jest.mock('axios');
jest.mock('nodemailer');
jest.mock('../../lib/main/server/storageConnection');

describe('SlackService.sendAlert', () => {
  let mockStorageConnection;

  beforeEach(() => {
    mockStorageConnection = {
      getConfig: jest.fn()
    };
    getStorageConnection.mockReturnValue(mockStorageConnection);
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {}); // Mock console.error
    jest.spyOn(console, 'log').mockImplementation(() => {}); // Mock console.log
  });

  it('should include server name in the Slack payload when provided in messageExtraInfo', async () => {
    const mockConfig = {
      item: {
        value: JSON.stringify({
          url: 'https://hooks.slack.com/services/test',
          username: 'Errsole',
          icon_url: 'https://avatars.githubusercontent.com/u/84983840',
          status: true
        })
      }
    };
    const mockAlertUrlData = {
      item: {
        value: JSON.stringify({
          url: 'http://example.com'
        })
      }
    };
    mockStorageConnection.getConfig
      .mockResolvedValueOnce(mockConfig) // Slack config
      .mockResolvedValueOnce(mockAlertUrlData); // Alert URL config

    const mockServerName = 'TestServer';
    const messageExtraInfo = {
      appName: 'TestApp',
      environmentName: 'TestEnv',
      serverName: mockServerName
    };

    axios.post.mockResolvedValue({});

    await SlackService.sendAlert('Test message', 'Test type', messageExtraInfo, '12345');

    expect(axios.post).toHaveBeenCalledWith(
      'https://hooks.slack.com/services/test',
      expect.objectContaining({
        blocks: expect.arrayContaining([
          {
            type: 'rich_text',
            elements: [
              {
                type: 'rich_text_section',
                elements: expect.arrayContaining([
                  { type: 'text', text: 'Server Name: ', style: { bold: true } },
                  { type: 'text', text: mockServerName }
                ])
              }
            ]
          }
        ])
      })
    );
  });

  it('should not include server name in the Slack payload if not provided', async () => {
    const mockConfig = {
      item: {
        value: JSON.stringify({
          url: 'https://hooks.slack.com/services/test',
          username: 'Errsole',
          icon_url: 'https://avatars.githubusercontent.com/u/84983840',
          status: true
        })
      }
    };
    const mockAlertUrlData = {
      item: {
        value: JSON.stringify({
          url: 'http://example.com'
        })
      }
    };
    mockStorageConnection.getConfig
      .mockResolvedValueOnce(mockConfig) // Slack config
      .mockResolvedValueOnce(mockAlertUrlData); // Alert URL config

    const messageExtraInfo = {
      appName: 'TestApp',
      environmentName: 'TestEnv'
    };

    axios.post.mockResolvedValue({});

    await SlackService.sendAlert('Test message', 'Test type', messageExtraInfo, '12345');

    expect(axios.post).toHaveBeenCalledWith(
      'https://hooks.slack.com/services/test',
      expect.objectContaining({
        blocks: expect.not.arrayContaining([
          {
            type: 'rich_text',
            elements: [
              {
                type: 'rich_text_section',
                elements: expect.arrayContaining([
                  { type: 'text', text: 'Server Name: ', style: { bold: true } }
                ])
              }
            ]
          }
        ])
      })
    );
  });

  it('should successfully send a Slack alert', async () => {
    const mockConfig = {
      item: {
        value: JSON.stringify({
          url: 'https://hooks.slack.com/services/test',
          username: 'Errsole',
          icon_url: 'https://avatars.githubusercontent.com/u/84983840',
          status: true
        })
      }
    };
    mockStorageConnection.getConfig.mockResolvedValue(mockConfig);

    axios.post.mockResolvedValue({});

    const result = await SlackService.sendAlert('Test message', 'Test type', { appName: 'TestApp', environmentName: 'TestEnv' });
    expect(axios.post).toHaveBeenCalledWith('https://hooks.slack.com/services/test', expect.objectContaining({
      username: 'Errsole',
      icon_url: 'https://avatars.githubusercontent.com/u/84983840',
      blocks: expect.any(Array)
    }));
    expect(result).toBe(true);
  });

  it('should handle Slack integration disabled', async () => {
    const mockConfig = {
      item: {
        value: JSON.stringify({
          status: false
        })
      }
    };
    mockStorageConnection.getConfig.mockResolvedValue(mockConfig);

    const result = await SlackService.sendAlert('Test message', 'Test type', {});
    expect(result).toBe(false);
    expect(console.log).toHaveBeenCalledWith('Slack integration is disabled.');
  });

  it('should handle missing Slack configuration', async () => {
    mockStorageConnection.getConfig.mockResolvedValue(null);

    const result = await SlackService.sendAlert('Test message', 'Test type', {});
    expect(result).toBe(false);
  });

  it('should handle Slack send timeout', async () => {
    jest.setTimeout(15000); // Increase the timeout for this test case

    const mockConfig = {
      item: {
        value: JSON.stringify({
          url: 'https://hooks.slack.com/services/test',
          username: 'Errsole',
          icon_url: 'https://avatars.githubusercontent.com/u/84983840',
          status: true
        })
      }
    };
    mockStorageConnection.getConfig.mockResolvedValue(mockConfig);

    axios.post.mockImplementation(() => new Promise((resolve, reject) => setTimeout(() => reject(new Error('Slack send timed out')), 2000))); // Shorter delay

    const result = await SlackService.sendAlert('Test message', 'Test type', {});
    expect(result).toBe(false);
  });

  it('should handle Slack send rejection', async () => {
    const mockConfig = {
      item: {
        value: JSON.stringify({
          url: 'https://hooks.slack.com/services/test',
          username: 'Errsole',
          icon_url: 'https://avatars.githubusercontent.com/u/84983840',
          status: true
        })
      }
    };
    mockStorageConnection.getConfig.mockResolvedValue(mockConfig);

    axios.post.mockRejectedValue(new Error('Send failed'));

    const result = await SlackService.sendAlert('Test message', 'Test type', {});
    expect(result).toBe(false);
  });

  it('should log error and return false during Slack alert sending error', async () => {
    mockStorageConnection.getConfig.mockImplementation(() => {
      throw new Error('Unexpected error');
    });

    const result = await SlackService.sendAlert('Test message', 'Test type', {});
    expect(console.error).toHaveBeenCalledWith('Failed to send slack alert:', expect.any(Error));
    expect(result).toBe(false);
  });

  it('should handle no config found', async () => {
    const mockConfig = {
      item: null
    };
    mockStorageConnection.getConfig.mockResolvedValue(mockConfig);

    const result = await SlackService.sendAlert('Test message', 'Test type', {});
    expect(result).toBe(false);
  });

  it('should correctly parse and construct alert URL with errsoleLogId and timestamp', async () => {
    const mockAlertUrlData = {
      item: {
        value: JSON.stringify({
          url: 'http://example.com'
        })
      }
    };
    const mockErrsoleLogId = '12345';
    const parsedAlertUrlValue = JSON.parse(mockAlertUrlData.item.value);
    const timestamp = new Date(new Date().getTime() + 2000).toISOString();
    const alertUrl = parsedAlertUrlValue.url + '#/logs?errsole_log_id=' + mockErrsoleLogId + '&timestamp=' + timestamp;

    expect(alertUrl).toEqual(`http://example.com#/logs?errsole_log_id=${mockErrsoleLogId}&timestamp=${timestamp}`);
  });

  it('should handle invalid JSON in alertUrlData gracefully', () => {
    const mockAlertUrlData = { item: { value: 'invalid_json' } };

    expect(() => {
      JSON.parse(mockAlertUrlData.item.value);
    }).toThrow();
  });

  it('should handle missing errsoleLogId and still construct the URL', () => {
    const mockAlertUrlData = {
      item: {
        value: JSON.stringify({
          url: 'http://example.com'
        })
      }
    };
    const mockErrsoleLogId = undefined;
    const parsedAlertUrlValue = JSON.parse(mockAlertUrlData.item.value);
    const timestamp = new Date(new Date().getTime() + 2000).toISOString();
    const alertUrl = parsedAlertUrlValue.url + '#/logs?errsole_log_id=' + mockErrsoleLogId + '&timestamp=' + timestamp;

    expect(alertUrl).toEqual(`http://example.com#/logs?errsole_log_id=${mockErrsoleLogId}&timestamp=${timestamp}`);
  });

  it('should return an empty string if URL is missing in alertUrlData', () => {
    const mockAlertUrlData = {
      item: {
        value: JSON.stringify({
          url: ''
        })
      }
    };
    const mockErrsoleLogId = '12345';
    const parsedAlertUrlValue = JSON.parse(mockAlertUrlData.item.value);
    const timestamp = new Date(new Date().getTime() + 2000).toISOString();
    const alertUrl = parsedAlertUrlValue.url + '#/logs?errsole_log_id=' + mockErrsoleLogId + '&timestamp=' + timestamp;

    expect(alertUrl).toEqual(`#/logs?errsole_log_id=${mockErrsoleLogId}&timestamp=${timestamp}`);
  });
});

describe('EmailService.sendAlert', () => {
  let mockStorageConnection;

  beforeEach(() => {
    mockStorageConnection = {
      getConfig: jest.fn()
    };
    getStorageConnection.mockReturnValue(mockStorageConnection);
    EmailService.transporter = null; // Reset transporter before each test
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {}); // Mock console.error
    jest.spyOn(console, 'log').mockImplementation(() => {}); // Mock console.log
  });

  it('should successfully send an email alert', async () => {
    const mockConfig = {
      item: {
        value: JSON.stringify({
          host: 'smtp.example.com',
          port: '587',
          username: 'user@example.com',
          password: 'password',
          sender: 'sender@example.com',
          receivers: 'receiver@example.com',
          status: true
        })
      }
    };
    mockStorageConnection.getConfig.mockResolvedValue(mockConfig);

    const mockTransporter = {
      sendMail: jest.fn().mockResolvedValue({})
    };
    nodemailer.createTransport.mockReturnValue(mockTransporter);

    const result = await EmailService.sendAlert('Test message', 'Test type', { appName: 'TestApp', environmentName: 'TestEnv' });

    expect(mockTransporter.sendMail).toHaveBeenCalledWith(expect.objectContaining({
      from: 'sender@example.com',
      to: 'receiver@example.com',
      subject: 'Errsole: Test type (TestApp app, TestEnv environment)',
      html: expect.stringContaining('<p><b>App Name: TestApp\nEnvironment Name: TestEnv</b></p>')
    }));
    expect(result).toBe(true);
  });

  it('should log error and return false when email transporter initialization fails', async () => {
    mockStorageConnection.getConfig.mockImplementation(() => {
      throw new Error('Unexpected error');
    });

    const result = await EmailService.sendAlert('Test message', 'Test type', {});
    expect(console.error).toHaveBeenCalledWith('Failed to create email transporter: ', expect.any(Error));
    expect(result).toBe(false);
  });

  it('should handle no transporter available', async () => {
    EmailService.transporter = null;

    const result = await EmailService.sendAlert('Test message', 'Test type', {});
    expect(result).toBe(false);
  });

  it('should handle missing email configuration', async () => {
    mockStorageConnection.getConfig.mockResolvedValue(null);

    const result = await EmailService.sendAlert('Test message', 'Test type', {});
    expect(result).toBe(false);
  });

  it('should handle email integration disabled', async () => {
    const mockConfig = {
      item: {
        value: JSON.stringify({
          status: false
        })
      }
    };
    mockStorageConnection.getConfig.mockResolvedValue(mockConfig);

    const result = await EmailService.sendAlert('Test message', 'Test type', {});
    expect(result).toBe(false);
    expect(console.log).toHaveBeenCalledWith('Email integration is disabled.');
  });

  it('should construct email with appName and environmentName', async () => {
    const mockConfig = {
      item: {
        value: JSON.stringify({
          host: 'smtp.example.com',
          port: '587',
          username: 'user@example.com',
          password: 'password',
          sender: 'sender@example.com',
          receivers: 'receiver@example.com',
          status: true
        })
      }
    };
    mockStorageConnection.getConfig.mockResolvedValue(mockConfig);

    const mockTransporter = {
      sendMail: jest.fn().mockResolvedValue({})
    };
    nodemailer.createTransport.mockReturnValue(mockTransporter);

    const result = await EmailService.sendAlert('Test message', 'Test type', { appName: 'TestApp', environmentName: 'TestEnv' });

    expect(mockTransporter.sendMail).toHaveBeenCalledWith(expect.objectContaining({
      from: 'sender@example.com',
      to: 'receiver@example.com',
      subject: 'Errsole: Test type (TestApp app, TestEnv environment)',
      html: expect.stringContaining('<p><b>App Name: TestApp\nEnvironment Name: TestEnv</b></p>')
    }));
    expect(result).toBe(true);
  });

  it('should construct email with only environmentName', async () => {
    const mockConfig = {
      item: {
        value: JSON.stringify({
          host: 'smtp.example.com',
          port: '587',
          username: 'user@example.com',
          password: 'password',
          sender: 'sender@example.com',
          receivers: 'receiver@example.com',
          status: true
        })
      }
    };
    mockStorageConnection.getConfig.mockResolvedValue(mockConfig);

    const mockTransporter = {
      sendMail: jest.fn().mockResolvedValue({})
    };
    nodemailer.createTransport.mockReturnValue(mockTransporter);

    const result = await EmailService.sendAlert('Test message', 'Test type', { environmentName: 'TestEnv' });

    expect(mockTransporter.sendMail).toHaveBeenCalledWith(expect.objectContaining({
      from: 'sender@example.com',
      to: 'receiver@example.com',
      subject: 'Errsole: Test type (TestEnv environment)',
      html: expect.stringContaining('<p><b>Environment Name: TestEnv</b></p>')
    }));
    expect(result).toBe(true);
  });

  it('should construct email without appName, environmentName, or serverName', async () => {
    const mockConfig = {
      item: {
        value: JSON.stringify({
          host: 'smtp.example.com',
          port: '587',
          username: 'user@example.com',
          password: 'password',
          sender: 'sender@example.com',
          receivers: 'receiver@example.com',
          status: true
        })
      }
    };
    mockStorageConnection.getConfig.mockResolvedValue(mockConfig);

    const mockTransporter = {
      sendMail: jest.fn().mockResolvedValue({})
    };
    nodemailer.createTransport.mockReturnValue(mockTransporter);

    const result = await EmailService.sendAlert('Test message', 'Test type', {});

    expect(mockTransporter.sendMail).toHaveBeenCalledWith(expect.objectContaining({
      from: 'sender@example.com',
      to: 'receiver@example.com',
      subject: 'Errsole: Test type',
      html: 'Test message'
    }));
    expect(result).toBe(true);
  });

  it('should handle email send timeout', async () => {
    jest.setTimeout(15000); // Increase the timeout for this test case

    const mockConfig = {
      item: {
        value: JSON.stringify({
          host: 'smtp.example.com',
          port: '587',
          username: 'user@example.com',
          password: 'password',
          sender: 'sender@example.com',
          receivers: 'receiver@example.com',
          status: true
        })
      }
    };
    mockStorageConnection.getConfig.mockResolvedValue(mockConfig);

    const mockTransporter = {
      sendMail: jest.fn(() => new Promise((resolve, reject) => setTimeout(() => reject(new Error('Email send timed out')), 2000))) // Shorter delay
    };
    nodemailer.createTransport.mockReturnValue(mockTransporter);

    const result = await EmailService.sendAlert('Test message', 'Test type', { appName: 'TestApp', environmentName: 'TestEnv' });
    expect(result).toBe(false);
  });

  it('should send email successfully before timeout', async () => {
    const mockConfig = {
      item: {
        value: JSON.stringify({
          host: 'smtp.example.com',
          port: '587',
          username: 'user@example.com',
          password: 'password',
          sender: 'sender@example.com',
          receivers: 'receiver@example.com',
          status: true
        })
      }
    };
    mockStorageConnection.getConfig.mockResolvedValue(mockConfig);

    const mockTransporter = {
      sendMail: jest.fn(() => new Promise((resolve) => {
        // Simulate email sending that finishes before the timeout
        setTimeout(() => resolve({}), 2000);
      }))
    };
    nodemailer.createTransport.mockReturnValue(mockTransporter);

    const result = await EmailService.sendAlert('Test message', 'Test type', { appName: 'TestApp', environmentName: 'TestEnv' });

    // Ensure that the email was sent successfully within the timeout period
    expect(result).toBe(true);
    expect(console.log).not.toHaveBeenCalledWith(expect.any(Error));
  });
});
