const { getStorageConnection } = require('../../lib/main/server/storageConnection');
const axios = require('axios');
const nodemailer = require('nodemailer');
const { EmailService, SlackService, testSlackAlert, testEmailAlert, clearEmailTransport, customLoggerAlert, handleUncaughtExceptions } = require('../../lib/main/server/utils/alerts'); // Adjust the path as needed
/* globals expect, jest, beforeEach, describe, beforeAll, afterAll, it, afterEach */
const crypto = require('crypto');

jest.mock('axios');
jest.mock('nodemailer');
jest.mock('../../lib/main/server/storageConnection');

let originalConsoleError;
let originalConsoleLog;
let activeTimeouts = [];
const originalSetTimeout = global.setTimeout;

const TEST_PASSWORD = process.env.TEST_PASSWORD || 'default_test_password';

beforeAll(() => {
  originalConsoleError = console.error;
  console.error = jest.fn();
  originalConsoleLog = console.log;
  console.log = jest.fn();

  jest.spyOn(global, 'setTimeout').mockImplementation((fn, delay) => {
    const timeout = originalSetTimeout(fn, delay);
    activeTimeouts.push(timeout);
    return timeout;
  });
});

afterAll(() => {
  console.error = originalConsoleError;
  console.log = originalConsoleLog;
  global.setTimeout.mockRestore();
});

afterEach(() => {
  activeTimeouts.forEach(clearTimeout);
  activeTimeouts = [];
  jest.clearAllTimers();
  jest.useRealTimers();
  jest.resetAllMocks();
});

jest.setTimeout(10000); // Set global timeout for the tests

describe('EmailService', () => {
  let mockStorageConnection;

  beforeEach(() => {
    mockStorageConnection = {
      getConfig: jest.fn()
    };
    getStorageConnection.mockReturnValue(mockStorageConnection);
    EmailService.transporter = null; // Reset transporter before each test
  });

  it('should create email transporter when emailTransport is called', async () => {
    const mockConfig = {
      item: {
        value: JSON.stringify({
          host: 'smtp.example.com',
          port: '587',
          username: 'user@example.com',
          password: TEST_PASSWORD,
          sender: 'sender@example.com',
          receivers: 'receiver@example.com',
          status: true
        })
      }
    };
    mockStorageConnection.getConfig.mockResolvedValue(mockConfig);

    const mockTransporter = {
      sendMail: jest.fn()
    };
    nodemailer.createTransport.mockReturnValue(mockTransporter);

    await EmailService.emailTransport();

    expect(nodemailer.createTransport).toHaveBeenCalledWith(expect.objectContaining({
      host: 'smtp.example.com',
      port: 587,
      auth: {
        user: 'user@example.com',
        pass: TEST_PASSWORD
      }
    }));
    expect(EmailService.transporter).toBe(mockTransporter);
  });

  it('should successfully send an email alert', async () => {
    const mockConfig = {
      item: {
        value: JSON.stringify({
          host: 'smtp.example.com',
          port: '587',
          username: 'user@example.com',
          password: TEST_PASSWORD,
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

    // Corrected regex: <pre> comes before <br/>
    expect(mockTransporter.sendMail).toHaveBeenCalledWith(expect.objectContaining({
      from: 'sender@example.com',
      to: 'receiver@example.com',
      subject: 'Errsole: Test type (TestApp app, TestEnv environment)',
      html: expect.stringMatching(
        /<p><b>App Name:<\/b> TestApp<\/p>\s*<p><b>Environment Name:<\/b> TestEnv<\/p><pre style="border: 1px solid #ccc; background-color: #f9f9f9; padding: 10px;">Test message<\/pre><br\/><p style="margin:0px;font-size:small"><i>Note:<ul style="margin:0px;padding:0px 5px;"><li>You will not receive another notification for this error on this server within the current hour\.<\/li><li>Errsole uses the UTC timezone in notifications\.<\/li><\/ul><\/i><\/p>/
      )
    }));
    expect(result).toBe(true);
  });

  it('should log error and return false when email transporter initialization fails', async () => {
    getStorageConnection.mockReturnValue({
      getConfig: jest.fn().mockImplementation(() => {
        throw new Error('Unexpected error');
      })
    });

    const result = await EmailService.sendAlert('Test message', 'Test type', {});
    expect(console.error).toHaveBeenCalledWith('Failed to create email transporter: ', expect.any(Error));
    expect(result).toBe(false);
  });

  it('should handle transporter initialization failure', async () => {
    getStorageConnection.mockReturnValue({
      getConfig: jest.fn().mockImplementation(() => {
        throw new Error('Unexpected error');
      })
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

  it('should construct email with appName and environmentName', async () => {
    const mockConfig = {
      item: {
        value: JSON.stringify({
          host: 'smtp.example.com',
          port: '587',
          username: 'user@example.com',
          password: TEST_PASSWORD,
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
      html: expect.stringMatching(
        /<p><b>App Name:<\/b> TestApp<\/p>\s*<p><b>Environment Name:<\/b> TestEnv<\/p><pre style="border: 1px solid #ccc; background-color: #f9f9f9; padding: 10px;">Test message<\/pre><br\/><p style="margin:0px;font-size:small"><i>Note:<ul style="margin:0px;padding:0px 5px;"><li>You will not receive another notification for this error on this server within the current hour\.<\/li><li>Errsole uses the UTC timezone in notifications\.<\/li><\/ul><\/i><\/p>/
      )
    }));
  });

  it('should construct email with only appName', async () => {
    const mockConfig = {
      item: {
        value: JSON.stringify({
          host: 'smtp.example.com',
          port: '587',
          username: 'user@example.com',
          password: TEST_PASSWORD,
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
      html: expect.stringMatching(
        /<p><b>App Name:<\/b> TestApp<\/p><pre style="border: 1px solid #ccc; background-color: #f9f9f9; padding: 10px;">Test message<\/pre><br\/><p style="margin:0px;font-size:small"><i>Note:<ul style="margin:0px;padding:0px 5px;"><li>You will not receive another notification for this error on this server within the current hour\.<\/li><li>Errsole uses the UTC timezone in notifications\.<\/li><\/ul><\/i><\/p>/
      )
    }));
  });

  it('should construct email with only environmentName', async () => {
    const mockConfig = {
      item: {
        value: JSON.stringify({
          host: 'smtp.example.com',
          port: '587',
          username: 'user@example.com',
          password: TEST_PASSWORD,
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
      html: expect.stringMatching(
        /<p><b>Environment Name:<\/b> TestEnv<\/p><pre style="border: 1px solid #ccc; background-color: #f9f9f9; padding: 10px;">Test message<\/pre><br\/><p style="margin:0px;font-size:small"><i>Note:<ul style="margin:0px;padding:0px 5px;"><li>You will not receive another notification for this error on this server within the current hour\.<\/li><li>Errsole uses the UTC timezone in notifications\.<\/li><\/ul><\/i><\/p>/
      )
    }));
  });

  it('should construct email without appName, environmentName, or serverName', async () => {
    const mockConfig = {
      item: {
        value: JSON.stringify({
          host: 'smtp.example.com',
          port: '587',
          username: 'user@example.com',
          password: TEST_PASSWORD,
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
      html: expect.stringMatching(
        /<pre style="border: 1px solid #ccc; background-color: #f9f9f9; padding: 10px;">Test message<\/pre><br\/><p style="margin:0px;font-size:small"><i>Note:<ul style="margin:0px;padding:0px 5px;"><li>You will not receive another notification for this error on this server within the current hour\.<\/li><li>Errsole uses the UTC timezone in notifications\.<\/li><\/ul><\/i><\/p>/
      )
    }));
  });
});

describe('SlackService', () => {
  let mockStorageConnection;

  beforeEach(() => {
    mockStorageConnection = {
      getConfig: jest.fn()
    };
    getStorageConnection.mockReturnValue(mockStorageConnection);
    jest.useFakeTimers(); // Use fake timers
  });

  it('should send slack alert when sendAlert is called', async () => {
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

  it('should handle slack integration disabled', async () => {
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
  });

  it('should handle missing slack configuration', async () => {
    mockStorageConnection.getConfig.mockResolvedValue(null);

    const result = await SlackService.sendAlert('Test message', 'Test type', {});

    expect(result).toBe(false);
  });

  it('should handle slack send rejection error', async () => {
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

    axios.post.mockRejectedValue(new Error('Network error'));

    const result = await SlackService.sendAlert('Test message', 'Test type', { appName: 'TestApp', environmentName: 'TestEnv' });

    expect(result).toBe(false);
  });

  it('should handle exception in sendAlert', async () => {
    mockStorageConnection.getConfig.mockImplementation(() => { throw new Error('Unexpected error'); });

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

describe('testSlackAlert', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    SlackService.sendAlert = jest.fn();
  });

  it('should return true on successful Slack test alert', async () => {
    SlackService.sendAlert.mockResolvedValue(true);
    getStorageConnection.mockReturnValue({
      getConfig: jest.fn().mockResolvedValue({
        item: JSON.stringify({ status: true, url: 'http://slack-webhook-url', username: 'Errsole' })
      })
    });

    const result = await testSlackAlert('Test message', { appName: 'TestApp' });
    expect(result).toBe(true);
    expect(SlackService.sendAlert).toHaveBeenCalledWith('Test message', 'Test', { appName: 'TestApp' });
  });

  it('should return false on Slack test alert failure', async () => {
    SlackService.sendAlert.mockRejectedValue(new Error('Slack failed'));
    getStorageConnection.mockReturnValue({
      getConfig: jest.fn().mockResolvedValue({
        item: JSON.stringify({ status: true, url: 'http://slack-webhook-url', username: 'Errsole' })
      })
    });

    const result = await testSlackAlert('Test message', { appName: 'TestApp' });
    expect(result).toBe(false);
    expect(SlackService.sendAlert).toHaveBeenCalledWith('Test message', 'Test', { appName: 'TestApp' });
    expect(console.error).toHaveBeenCalledWith('Error in testSlackAlert:', expect.any(Error));
  });
});

describe('testEmailAlert', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    EmailService.sendAlert = jest.fn();
  });

  it('should return true on successful Email test alert', async () => {
    EmailService.sendAlert.mockResolvedValue(true);
    getStorageConnection.mockReturnValue({
      getConfig: jest.fn().mockResolvedValue({
        item: JSON.stringify({
          status: true,
          host: 'smtp.test.com',
          port: '587',
          username: 'testuser',
          password: TEST_PASSWORD,
          sender: 'test@test.com',
          receivers: ['receiver@test.com']
        })
      })
    });

    const result = await testEmailAlert('Test message', { appName: 'TestApp' });
    expect(result).toBe(true);
    expect(EmailService.sendAlert).toHaveBeenCalledWith('Test message', 'Test', { appName: 'TestApp' });
  });

  it('should return false on Email test alert failure', async () => {
    EmailService.sendAlert.mockRejectedValue(new Error('Email failed'));
    getStorageConnection.mockReturnValue({
      getConfig: jest.fn().mockResolvedValue({
        item: JSON.stringify({
          status: true,
          host: 'smtp.test.com',
          port: '587',
          username: 'testuser',
          password: TEST_PASSWORD,
          sender: 'test@test.com',
          receivers: ['receiver@test.com']
        })
      })
    });

    const result = await testEmailAlert('Test message', { appName: 'TestApp' });
    expect(result).toBe(false);
    expect(EmailService.sendAlert).toHaveBeenCalledWith('Test message', 'Test', { appName: 'TestApp' });
    expect(console.error).toHaveBeenCalledWith('Error in testEmailAlert:', expect.any(Error));
  });
});

describe('EmailService.clearEmailTransport', () => {
  beforeEach(() => {
    EmailService.transporter = {}; // Set to a non-null value for setup
  });

  it('should clear the email transporter and return true', async () => {
    const result = await clearEmailTransport();

    expect(EmailService.transporter).toBe(null);
    expect(result).toBe(true);
  });

  it('should return true even if transporter is already null', async () => {
    EmailService.transporter = null; // Ensure transporter is already null

    const result = await clearEmailTransport();

    expect(EmailService.transporter).toBe(null);
    expect(result).toBe(true);
  });

  it('should correctly handle multiple calls', async () => {
    await clearEmailTransport();
    expect(EmailService.transporter).toBe(null);

    const result = await clearEmailTransport();
    expect(result).toBe(true);
    expect(EmailService.transporter).toBe(null);
  });
});

describe('handleUncaughtExceptions', () => {
  let mockStorageConnection;

  beforeEach(() => {
    mockStorageConnection = {
      insertNotificationItem: jest.fn()
    };
    getStorageConnection.mockReturnValue(mockStorageConnection);

    SlackService.sendAlert = jest.fn();
    EmailService.sendAlert = jest.fn();

    console.error.mockClear();
  });

  const mockStringify = (input) => {
    if (typeof input === 'string') return input;
    try {
      return JSON.stringify(input);
    } catch {
      return String(input);
    }
  };

  it('should send both Slack and email alerts successfully and return true', async () => {
    // Arrange
    const message = 'Test message';
    const messageExtraInfo = { appName: 'TestApp' };
    const errsoleLogId = 'logId123';

    // Mock insertNotificationItem to simulate no previous alert
    mockStorageConnection.insertNotificationItem.mockResolvedValue({
      previousNotificationItem: null,
      todayNotificationCount: 1
    });

    // Mock successful alert sending
    SlackService.sendAlert.mockResolvedValue(true);
    EmailService.sendAlert.mockResolvedValue(true);

    // Act
    const result = await handleUncaughtExceptions(message, messageExtraInfo, errsoleLogId);

    // Assert
    // Generate expected hash
    const combined = `${mockStringify(message)}|${mockStringify(messageExtraInfo)}`;
    const hashedMessage = crypto.createHash('sha256').update(combined).digest('hex');

    // Verify insertNotificationItem was called correctly
    expect(mockStorageConnection.insertNotificationItem).toHaveBeenCalledWith({
      errsole_id: errsoleLogId,
      hashed_message: hashedMessage,
      hostname: undefined // serverName is not provided
    });

    // Verify Slack and Email alerts were sent with the correct parameters
    expect(SlackService.sendAlert).toHaveBeenCalledWith(
      message,
      'Uncaught Exception',
      messageExtraInfo,
      errsoleLogId,
      1, // todayCount
      undefined // timestamp
    );
    expect(EmailService.sendAlert).toHaveBeenCalledWith(
      message,
      'Uncaught Exception',
      messageExtraInfo,
      errsoleLogId,
      1, // todayCount
      undefined // timestamp
    );

    // Expect the function to return true
    expect(result).toBe(true);
  });

  it('should return false when email alert fails but Slack alert succeeds', async () => {
    // Arrange
    const message = 'Test message';
    const messageExtraInfo = { appName: 'TestApp' };
    const errsoleLogId = 'logId123';

    // Mock insertNotificationItem to simulate no previous alert
    mockStorageConnection.insertNotificationItem.mockResolvedValue({
      previousNotificationItem: null,
      todayNotificationCount: 1
    });

    // Mock Slack alert to succeed and Email alert to fail
    SlackService.sendAlert.mockResolvedValue(true);
    EmailService.sendAlert.mockRejectedValue(new Error('Email failed'));

    // Act
    const result = await handleUncaughtExceptions(message, messageExtraInfo, errsoleLogId);

    // Assert
    expect(SlackService.sendAlert).toHaveBeenCalledWith(
      message,
      'Uncaught Exception',
      messageExtraInfo,
      errsoleLogId,
      1, // todayCount
      undefined // timestamp
    );
    expect(EmailService.sendAlert).toHaveBeenCalledWith(
      message,
      'Uncaught Exception',
      messageExtraInfo,
      errsoleLogId,
      1, // todayCount
      undefined // timestamp
    );
    expect(result).toBe(false);
    expect(console.error).toHaveBeenCalledWith('Error in handleUncaughtExceptions:', expect.any(Error));
  });

  it('should return false when Slack alert fails but email alert succeeds', async () => {
    // Arrange
    const message = 'Test message';
    const messageExtraInfo = { appName: 'TestApp' };
    const errsoleLogId = 'logId123';

    // Mock insertNotificationItem to simulate no previous alert
    mockStorageConnection.insertNotificationItem.mockResolvedValue({
      previousNotificationItem: null,
      todayNotificationCount: 1
    });

    // Mock Slack alert to fail and Email alert to succeed
    SlackService.sendAlert.mockRejectedValueOnce(new Error('Slack failed'));
    EmailService.sendAlert.mockResolvedValueOnce(true); // This should NOT be called

    // Act
    const result = await handleUncaughtExceptions(message, messageExtraInfo, errsoleLogId);

    // Assert
    expect(SlackService.sendAlert).toHaveBeenCalledWith(
      message,
      'Uncaught Exception',
      messageExtraInfo,
      errsoleLogId,
      1, // todayCount
      undefined // timestamp
    );
    // EmailService.sendAlert should NOT have been called because Slack alert failed
    expect(EmailService.sendAlert).not.toHaveBeenCalled();
    expect(result).toBe(false);
    expect(console.error).toHaveBeenCalledWith('Error in handleUncaughtExceptions:', expect.any(Error));
  });

  it('should return false when both Slack and email alerts fail', async () => {
    // Arrange
    const message = 'Test message';
    const messageExtraInfo = { appName: 'TestApp' };
    const errsoleLogId = 'logId123';

    // Mock insertNotificationItem to simulate no previous alert
    mockStorageConnection.insertNotificationItem.mockResolvedValue({
      previousNotificationItem: null,
      todayNotificationCount: 1
    });

    // Mock both Slack and Email alerts to fail
    SlackService.sendAlert.mockRejectedValueOnce(new Error('Slack failed'));
    EmailService.sendAlert.mockRejectedValueOnce(new Error('Email failed')); // This should NOT be called

    // Act
    const result = await handleUncaughtExceptions(message, messageExtraInfo, errsoleLogId);

    // Assert
    expect(SlackService.sendAlert).toHaveBeenCalledWith(
      message,
      'Uncaught Exception',
      messageExtraInfo,
      errsoleLogId,
      1, // todayCount
      undefined // timestamp
    );
    // EmailService.sendAlert should NOT have been called because Slack alert failed
    expect(EmailService.sendAlert).not.toHaveBeenCalled();
    expect(result).toBe(false);
    expect(console.error).toHaveBeenCalledWith('Error in handleUncaughtExceptions:', expect.any(Error));
  });

  it('should not send alerts and return false when a duplicate alert exists', async () => {
    // Arrange
    const message = 'Duplicate alert message';
    const messageExtraInfo = { appName: 'TestApp', environmentName: 'TestEnv' };
    const errsoleLogId = 'logIdDuplicate';

    // Mock insertNotificationItem to simulate a duplicate alert
    mockStorageConnection.insertNotificationItem.mockResolvedValue({
      previousNotificationItem: {
        created_at: new Date().toISOString() // Current time to simulate within the same hour
      },
      todayNotificationCount: 5 // Arbitrary count
    });

    // Ensure that SlackService.sendAlert and EmailService.sendAlert are mocked
    SlackService.sendAlert.mockResolvedValue(true);
    EmailService.sendAlert.mockResolvedValue(true);

    // Act
    const result = await handleUncaughtExceptions(message, messageExtraInfo, errsoleLogId);

    // Assert
    // Verify that the function returns false
    expect(result).toBe(false);

    // Ensure that no alerts were sent
    expect(SlackService.sendAlert).not.toHaveBeenCalled();
    expect(EmailService.sendAlert).not.toHaveBeenCalled();

    // Ensure that no errors were logged
    expect(console.error).not.toHaveBeenCalled();
  });
});

describe('customLoggerAlert', () => {
  let mockStorageConnection;

  beforeEach(() => {
    mockStorageConnection = {
      insertNotificationItem: jest.fn()
    };
    getStorageConnection.mockReturnValue(mockStorageConnection);

    SlackService.sendAlert = jest.fn();
    EmailService.sendAlert = jest.fn();

    // Clear previous error logs
    console.error.mockClear();
  });

  const mockStringify = (input) => {
    if (typeof input === 'string') return input;
    try {
      return JSON.stringify(input);
    } catch {
      return String(input);
    }
  };

  it('should send both Slack and email alerts successfully and return true when no duplicate exists', async () => {
    // Arrange
    const message = 'Test message';
    const messageExtraInfo = { appName: 'TestApp', environmentName: 'TestEnv' };
    const errsoleLogId = 'logId123';

    // Mock insertNotificationItem to simulate no previous alert
    mockStorageConnection.insertNotificationItem.mockResolvedValue({
      previousNotificationItem: null,
      todayNotificationCount: 1
    });

    // Mock successful alert sending
    SlackService.sendAlert.mockResolvedValue(true);
    EmailService.sendAlert.mockResolvedValue(true);

    // Act
    const result = await customLoggerAlert(message, messageExtraInfo, errsoleLogId);

    // Assert
    // Generate expected hash
    const combined = `${mockStringify(message)}|${mockStringify(messageExtraInfo)}`;
    const hashedMessage = crypto.createHash('sha256').update(combined).digest('hex');

    // Verify insertNotificationItem was called correctly
    expect(mockStorageConnection.insertNotificationItem).toHaveBeenCalledWith({
      errsole_id: errsoleLogId,
      hashed_message: hashedMessage,
      hostname: undefined // serverName is not provided
    });

    // Verify Slack and Email alerts were sent with the correct parameters
    expect(SlackService.sendAlert).toHaveBeenCalledWith(
      message,
      'Alert',
      messageExtraInfo,
      errsoleLogId,
      1, // todayCount
      undefined // timestamp
    );
    expect(EmailService.sendAlert).toHaveBeenCalledWith(
      message,
      'Alert',
      messageExtraInfo,
      errsoleLogId,
      1, // todayCount
      undefined // timestamp
    );

    // Expect the function to return true
    expect(result).toBe(true);
  });

  it('should return false when email alert fails but Slack alert succeeds', async () => {
    // Arrange
    const message = 'Test message';
    const messageExtraInfo = { appName: 'TestApp' };
    const errsoleLogId = 'logId123';

    // Mock insertNotificationItem to simulate no previous alert
    mockStorageConnection.insertNotificationItem.mockResolvedValue({
      previousNotificationItem: null,
      todayNotificationCount: 1
    });

    // Mock Slack alert to succeed and Email alert to fail
    SlackService.sendAlert.mockResolvedValue(true);
    EmailService.sendAlert.mockRejectedValue(new Error('Email failed'));

    // Act
    const result = await customLoggerAlert(message, messageExtraInfo, errsoleLogId);

    // Assert
    expect(SlackService.sendAlert).toHaveBeenCalledWith(
      message,
      'Alert',
      messageExtraInfo,
      errsoleLogId,
      1, // todayCount
      undefined // timestamp
    );
    expect(EmailService.sendAlert).toHaveBeenCalledWith(
      message,
      'Alert',
      messageExtraInfo,
      errsoleLogId,
      1, // todayCount
      undefined // timestamp
    );
    expect(result).toBe(false);
    expect(console.error).toHaveBeenCalledWith('Error in customLoggerAlert:', expect.any(Error));
  });

  it('should return false when Slack alert fails but email alert succeeds', async () => {
    // Arrange
    const message = 'Test message';
    const messageExtraInfo = { appName: 'TestApp' };
    const errsoleLogId = 'logId123';

    // Mock insertNotificationItem to simulate no previous alert
    mockStorageConnection.insertNotificationItem.mockResolvedValue({
      previousNotificationItem: null,
      todayNotificationCount: 1
    });

    // Mock Slack alert to fail and Email alert to succeed
    SlackService.sendAlert.mockRejectedValueOnce(new Error('Slack failed'));
    EmailService.sendAlert.mockResolvedValueOnce(true); // This should NOT be called

    // Act
    const result = await customLoggerAlert(message, messageExtraInfo, errsoleLogId);

    // Assert
    expect(SlackService.sendAlert).toHaveBeenCalledWith(
      message,
      'Alert',
      messageExtraInfo,
      errsoleLogId,
      1, // todayCount
      undefined // timestamp
    );
    // EmailService.sendAlert should NOT have been called because Slack alert failed
    expect(EmailService.sendAlert).not.toHaveBeenCalled();
    expect(result).toBe(false);
    expect(console.error).toHaveBeenCalledWith('Error in customLoggerAlert:', expect.any(Error));
  });

  it('should return false when both Slack and email alerts fail', async () => {
    // Arrange
    const message = 'Test message';
    const messageExtraInfo = { appName: 'TestApp' };
    const errsoleLogId = 'logId123';

    // Mock insertNotificationItem to simulate no previous alert
    mockStorageConnection.insertNotificationItem.mockResolvedValue({
      previousNotificationItem: null,
      todayNotificationCount: 1
    });

    // Mock both Slack and Email alerts to fail
    SlackService.sendAlert.mockRejectedValueOnce(new Error('Slack failed'));
    EmailService.sendAlert.mockRejectedValueOnce(new Error('Email failed')); // This should NOT be called

    // Act
    const result = await customLoggerAlert(message, messageExtraInfo, errsoleLogId);

    // Assert
    expect(SlackService.sendAlert).toHaveBeenCalledWith(
      message,
      'Alert',
      messageExtraInfo,
      errsoleLogId,
      1, // todayCount
      undefined // timestamp
    );
    // EmailService.sendAlert should NOT have been called because Slack alert failed
    expect(EmailService.sendAlert).not.toHaveBeenCalled();
    expect(result).toBe(false);
    expect(console.error).toHaveBeenCalledWith('Error in customLoggerAlert:', expect.any(Error));
  });

  it('should correctly handle non-string inputs by stringifying them and return true', async () => {
    const message = { text: 'Test message' };
    const messageExtraInfo = { appName: 'TestApp', environmentName: 'TestEnv', serverName: 'TestServer' };
    const errsoleLogId = 'logId123';

    // Mock insertNotificationItem to simulate no previous alert
    mockStorageConnection.insertNotificationItem.mockResolvedValue({
      previousNotificationItem: null,
      todayNotificationCount: 1
    });

    // Mock successful alert sending
    SlackService.sendAlert.mockResolvedValue(true);
    EmailService.sendAlert.mockResolvedValue(true);

    // Act
    const result = await customLoggerAlert(message, messageExtraInfo, errsoleLogId);

    // Assert
    expect(SlackService.sendAlert).toHaveBeenCalledWith(
      message,
      'Alert',
      messageExtraInfo,
      errsoleLogId,
      1, // todayCount
      undefined // timestamp
    );
    expect(EmailService.sendAlert).toHaveBeenCalledWith(
      message,
      'Alert',
      messageExtraInfo,
      errsoleLogId,
      1, // todayCount
      undefined // timestamp
    );
    expect(result).toBe(true);
  });

  it('should handle missing serverName in messageExtraInfo gracefully and return true', async () => {
    const message = 'Test message';
    const messageExtraInfo = { appName: 'TestApp', environmentName: 'TestEnv' }; // serverName missing
    const errsoleLogId = 'logId123';

    // Mock insertNotificationItem to simulate no previous alert
    mockStorageConnection.insertNotificationItem.mockResolvedValue({
      previousNotificationItem: null,
      todayNotificationCount: 1
    });

    // Mock successful alert sending
    SlackService.sendAlert.mockResolvedValue(true);
    EmailService.sendAlert.mockResolvedValue(true);

    // Act
    const result = await customLoggerAlert(message, messageExtraInfo, errsoleLogId);

    // Assert
    expect(SlackService.sendAlert).toHaveBeenCalledWith(
      message,
      'Alert',
      messageExtraInfo,
      errsoleLogId,
      1, // todayCount
      undefined // timestamp
    );
    expect(EmailService.sendAlert).toHaveBeenCalledWith(
      message,
      'Alert',
      messageExtraInfo,
      errsoleLogId,
      1, // todayCount
      undefined // timestamp
    );
    expect(result).toBe(true);
  });

  it('should handle unexpected data from insertNotificationItem and return true', async () => {
    const message = 'Test message';
    const messageExtraInfo = { appName: 'TestApp', environmentName: 'TestEnv', serverName: 'TestServer' };
    const errsoleLogId = 'logId123';

    // Mock insertNotificationItem to return unexpected data structure
    mockStorageConnection.insertNotificationItem.mockResolvedValue({
      // Missing previousNotificationItem and todayNotificationCount
    });

    // Act
    const result = await customLoggerAlert(message, messageExtraInfo, errsoleLogId);

    // Assert
    expect(SlackService.sendAlert).toHaveBeenCalledWith(
      message,
      'Alert',
      messageExtraInfo,
      errsoleLogId,
      undefined, // todayCount is undefined
      undefined // timestamp
    );
    expect(EmailService.sendAlert).toHaveBeenCalledWith(
      message,
      'Alert',
      messageExtraInfo,
      errsoleLogId,
      undefined, // todayCount is undefined
      undefined // timestamp
    );
    expect(result).toBe(true);
  });

  it('should return false when email alert fails but Slack alert succeeds with todayCount=0', async () => {
    // Arrange
    const message = 'Test message';
    const messageExtraInfo = { appName: 'TestApp' };
    const errsoleLogId = 'logId123';

    // Mock insertNotificationItem to simulate todayNotificationCount=0
    mockStorageConnection.insertNotificationItem.mockResolvedValue({
      previousNotificationItem: null,
      todayNotificationCount: 0
    });

    // Mock Slack alert to succeed and Email alert to fail
    SlackService.sendAlert.mockResolvedValue(true);
    EmailService.sendAlert.mockRejectedValue(new Error('Email failed'));

    // Act
    const result = await customLoggerAlert(message, messageExtraInfo, errsoleLogId);

    // Assert
    expect(SlackService.sendAlert).toHaveBeenCalledWith(
      message,
      'Alert',
      messageExtraInfo,
      errsoleLogId,
      0, // todayCount=0
      undefined // timestamp
    );
    expect(EmailService.sendAlert).toHaveBeenCalledWith(
      message,
      'Alert',
      messageExtraInfo,
      errsoleLogId,
      0, // todayCount=0
      undefined // timestamp
    );
    expect(result).toBe(false);
    expect(console.error).toHaveBeenCalledWith('Error in customLoggerAlert:', expect.any(Error));
  });

  it('should return false when Slack alert fails but email alert succeeds with todayCount=0', async () => {
    // Arrange
    const message = 'Test message';
    const messageExtraInfo = { appName: 'TestApp' };
    const errsoleLogId = 'logId123';

    // Mock insertNotificationItem to simulate todayNotificationCount=0
    mockStorageConnection.insertNotificationItem.mockResolvedValue({
      previousNotificationItem: null,
      todayNotificationCount: 0
    });

    // Mock Slack alert to fail and Email alert to succeed
    SlackService.sendAlert.mockRejectedValueOnce(new Error('Slack failed'));
    EmailService.sendAlert.mockResolvedValueOnce(true); // This should NOT be called

    // Act
    const result = await customLoggerAlert(message, messageExtraInfo, errsoleLogId);

    // Assert
    expect(SlackService.sendAlert).toHaveBeenCalledWith(
      message,
      'Alert',
      messageExtraInfo,
      errsoleLogId,
      0, // todayCount=0
      undefined // timestamp
    );
    // EmailService.sendAlert should NOT have been called because Slack alert failed
    expect(EmailService.sendAlert).not.toHaveBeenCalled();
    expect(result).toBe(false);
    expect(console.error).toHaveBeenCalledWith('Error in customLoggerAlert:', expect.any(Error));
  });

  it('should return false when both Slack and email alerts fail with todayCount=0', async () => {
    // Arrange
    const message = 'Test message';
    const messageExtraInfo = { appName: 'TestApp' };
    const errsoleLogId = 'logId123';

    // Mock insertNotificationItem to simulate todayNotificationCount=0
    mockStorageConnection.insertNotificationItem.mockResolvedValue({
      previousNotificationItem: null,
      todayNotificationCount: 0
    });

    // Mock both Slack and Email alerts to fail
    SlackService.sendAlert.mockRejectedValueOnce(new Error('Slack failed'));
    EmailService.sendAlert.mockRejectedValueOnce(new Error('Email failed')); // This should NOT be called

    // Act
    const result = await customLoggerAlert(message, messageExtraInfo, errsoleLogId);

    // Assert
    expect(SlackService.sendAlert).toHaveBeenCalledWith(
      message,
      'Alert',
      messageExtraInfo,
      errsoleLogId,
      0, // todayCount=0
      undefined // timestamp
    );
    // EmailService.sendAlert should NOT have been called because Slack alert failed
    expect(EmailService.sendAlert).not.toHaveBeenCalled();
    expect(result).toBe(false);
    expect(console.error).toHaveBeenCalledWith('Error in customLoggerAlert:', expect.any(Error));
  });
});
