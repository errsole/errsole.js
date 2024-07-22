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
      text: 'App Name: TestApp\nEnvironment Name: TestEnv\n\nTest message'
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
    expect(result).toBe(true);
    expect(mockTransporter.sendMail).toHaveBeenCalledWith(expect.objectContaining({
      from: 'sender@example.com',
      to: 'receiver@example.com',
      subject: 'Errsole: Test type (TestApp app, TestEnv environment)',
      text: 'App Name: TestApp\nEnvironment Name: TestEnv\n\nTest message'
    }));
  });

  it('should construct email with only appName', async () => {
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

    const result = await EmailService.sendAlert('Test message', 'Test type', { appName: 'TestApp' });
    expect(result).toBe(true);
    expect(mockTransporter.sendMail).toHaveBeenCalledWith(expect.objectContaining({
      from: 'sender@example.com',
      to: 'receiver@example.com',
      subject: 'Errsole: Test type (TestApp app)',
      text: 'App Name: TestApp\n\nTest message'
    }));
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
    expect(result).toBe(true);
    expect(mockTransporter.sendMail).toHaveBeenCalledWith(expect.objectContaining({
      from: 'sender@example.com',
      to: 'receiver@example.com',
      subject: 'Errsole: Test type (TestEnv environment)',
      text: 'Environment Name: TestEnv\n\nTest message'
    }));
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
    expect(result).toBe(true);
    expect(mockTransporter.sendMail).toHaveBeenCalledWith(expect.objectContaining({
      from: 'sender@example.com',
      to: 'receiver@example.com',
      subject: 'Errsole: Test type',
      text: 'Test message'
    }));
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
});
