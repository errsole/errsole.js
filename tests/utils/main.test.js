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

  beforeEach(() => {
    mockStorageConnection = {
      getConfig: jest.fn()
    };
    getStorageConnection.mockReturnValue(mockStorageConnection);
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {}); // Mock console.error
    jest.spyOn(console, 'log').mockImplementation(() => {}); // Mock console.log

    // Updated mock implementation based on key
    mockStorageConnection.getConfig.mockImplementation((key) => {
      if (key === 'slackIntegration') {
        return Promise.resolve(mockConfig);
      }
      if (key === 'alertUrl') {
        return Promise.resolve(mockAlertUrlData);
      }
      return Promise.resolve(null);
    });
  });

  it('should include server name in the Slack payload when provided in messageExtraInfo', async () => {
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
    // Update mock to disable Slack integration
    mockStorageConnection.getConfig.mockImplementation((key) => {
      if (key === 'slackIntegration') {
        return Promise.resolve({
          item: {
            value: JSON.stringify({
              status: false
            })
          }
        });
      }
      if (key === 'alertUrl') {
        return Promise.resolve(mockAlertUrlData);
      }
      return Promise.resolve(null);
    });

    const result = await SlackService.sendAlert('Test message', 'Test type', {});
    expect(result).toBe(false); // Expecting result to be false when Slack integration is disabled.
  });

  it('should handle missing Slack configuration', async () => {
    // Update mock to return null for slackIntegration
    mockStorageConnection.getConfig.mockImplementation((key) => {
      if (key === 'slackIntegration') {
        return Promise.resolve(null);
      }
      if (key === 'alertUrl') {
        return Promise.resolve(mockAlertUrlData);
      }
      return Promise.resolve(null);
    });

    const result = await SlackService.sendAlert('Test message', 'Test type', {});
    expect(result).toBe(false);
  });

  it('should handle Slack send timeout', async () => {
    jest.setTimeout(15000); // Increase the timeout for this test case

    axios.post.mockImplementation(() => new Promise((resolve, reject) => setTimeout(() => reject(new Error('Slack send timed out')), 2000))); // Shorter delay

    const result = await SlackService.sendAlert('Test message', 'Test type', {});
    expect(result).toBe(false);
  });

  it('should handle Slack send rejection', async () => {
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
    mockStorageConnection.getConfig.mockImplementation((key) => {
      if (key === 'slackIntegration') {
        return Promise.resolve({ item: null });
      }
      if (key === 'alertUrl') {
        return Promise.resolve(mockAlertUrlData);
      }
      return Promise.resolve(null);
    });

    const result = await SlackService.sendAlert('Test message', 'Test type', {});
    expect(result).toBe(false);
  });

  it('should correctly parse and construct alert URL with errsoleLogId and timestamp', async () => {
    const mockErrsoleLogId = '12345';
    const parsedAlertUrlValue = JSON.parse(mockAlertUrlData.item.value);
    const timestamp = new Date(new Date().getTime() + 2000).toISOString();
    const alertUrl = parsedAlertUrlValue.url + '#/logs?errsole_log_id=' + mockErrsoleLogId + '&timestamp=' + timestamp;

    expect(alertUrl).toEqual(`http://example.com#/logs?errsole_log_id=${mockErrsoleLogId}&timestamp=${timestamp}`);
  });

  it('should handle invalid JSON in alertUrlData gracefully', () => {
    const mockAlertUrlDataInvalid = { item: { value: 'invalid_json' } };
    mockStorageConnection.getConfig.mockImplementation((key) => {
      if (key === 'alertUrl') {
        return Promise.resolve(mockAlertUrlDataInvalid);
      }
      return Promise.resolve(null);
    });

    expect(() => {
      JSON.parse(mockAlertUrlDataInvalid.item.value);
    }).toThrow();
  });

  it('should handle missing errsoleLogId and still construct the URL', async () => {
    const mockErrsoleLogId = undefined;
    const parsedAlertUrlValue = JSON.parse(mockAlertUrlData.item.value);
    const timestamp = new Date(new Date().getTime() + 2000).toISOString();
    const alertUrl = parsedAlertUrlValue.url + '#/logs?errsole_log_id=' + mockErrsoleLogId + '&timestamp=' + timestamp;

    expect(alertUrl).toEqual(`http://example.com#/logs?errsole_log_id=${mockErrsoleLogId}&timestamp=${timestamp}`);
  });

  it('should return an empty string if URL is missing in alertUrlData', () => {
    const mockAlertUrlDataEmpty = {
      item: {
        value: JSON.stringify({
          url: ''
        })
      }
    };
    mockStorageConnection.getConfig.mockImplementation((key) => {
      if (key === 'alertUrl') {
        return Promise.resolve(mockAlertUrlDataEmpty);
      }
      return Promise.resolve(null);
    });

    const mockErrsoleLogId = '12345';
    const parsedAlertUrlValue = JSON.parse(mockAlertUrlDataEmpty.item.value);
    const timestamp = new Date(new Date().getTime() + 2000).toISOString();
    const alertUrl = parsedAlertUrlValue.url + '#/logs?errsole_log_id=' + mockErrsoleLogId + '&timestamp=' + timestamp;

    expect(alertUrl).toEqual(`#/logs?errsole_log_id=${mockErrsoleLogId}&timestamp=${timestamp}`);
  });

  it('should include todayCount message for Alert type in the Slack payload', async () => {
    const messageExtraInfo = {
      appName: 'TestApp',
      environmentName: 'TestEnv'
    };
    const todayCount = 3; // Example count

    axios.post.mockResolvedValue({});

    await SlackService.sendAlert('Test message', 'Alert', messageExtraInfo, '12345', todayCount);

    expect(axios.post).toHaveBeenCalledWith(
      'https://hooks.slack.com/services/test',
      expect.objectContaining({
        blocks: expect.arrayContaining([
          expect.objectContaining({
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `This alert has occurred *${todayCount} times today*.`
            }
          })
        ])
      })
    );
  });

  it('should include todayCount message for Uncaught Exception type in the Slack payload', async () => {
    const messageExtraInfo = {
      appName: 'TestApp',
      environmentName: 'TestEnv'
    };
    const todayCount = 5; // Example count

    axios.post.mockResolvedValue({});

    await SlackService.sendAlert('Test message', 'Uncaught Exception', messageExtraInfo, '12345', todayCount);

    expect(axios.post).toHaveBeenCalledWith(
      'https://hooks.slack.com/services/test',
      expect.objectContaining({
        blocks: expect.arrayContaining([
          expect.objectContaining({
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `This error has occurred *${todayCount} times today*.`
            }
          })
        ])
      })
    );
  });

  it('should not include todayCount message in the Slack payload when todayCount is not provided', async () => {
    const messageExtraInfo = {
      appName: 'TestApp',
      environmentName: 'TestEnv'
    };

    axios.post.mockResolvedValue({});

    await SlackService.sendAlert('Test message', 'Alert', messageExtraInfo, '12345');

    expect(axios.post).toHaveBeenCalledWith(
      'https://hooks.slack.com/services/test',
      expect.objectContaining({
        blocks: expect.not.arrayContaining([
          expect.objectContaining({
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: expect.stringContaining('This alert has occurred')
            }
          })
        ])
      })
    );
  });

  it('should correctly handle singular form for todayCount in the Slack payload', async () => {
    const messageExtraInfo = {
      appName: 'TestApp',
      environmentName: 'TestEnv'
    };
    const todayCount = 1; // Singular count

    axios.post.mockResolvedValue({});

    // Test with type 'Alert'
    const alertResult = await SlackService.sendAlert('Test message', 'Alert', messageExtraInfo, '12345', todayCount);

    expect(axios.post).toHaveBeenCalledWith(
      'https://hooks.slack.com/services/test',
      expect.objectContaining({
        blocks: expect.arrayContaining([
          expect.objectContaining({
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `This alert has occurred *${todayCount} time today*.`
            }
          })
        ])
      })
    );

    expect(alertResult).toBe(true); // Optionally verify the return value

    // Reset mocks for the next assertion
    jest.clearAllMocks();

    // Re-apply the mock implementation in beforeEach
    mockStorageConnection.getConfig.mockImplementation((key) => {
      if (key === 'slackIntegration') {
        return Promise.resolve(mockConfig);
      }
      if (key === 'alertUrl') {
        return Promise.resolve(mockAlertUrlData);
      }
      return Promise.resolve(null);
    });

    // Test with type 'Uncaught Exception'
    const exceptionResult = await SlackService.sendAlert('Test message', 'Uncaught Exception', messageExtraInfo, '12345', todayCount);

    expect(axios.post).toHaveBeenCalledWith(
      'https://hooks.slack.com/services/test',
      expect.objectContaining({
        blocks: expect.arrayContaining([
          expect.objectContaining({
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `This error has occurred *${todayCount} time today*.`
            }
          })
        ])
      })
    );

    expect(exceptionResult).toBe(true); // Optionally verify the return value
  });
});

describe('EmailService.sendAlert', () => {
  let mockStorageConnection;
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
  const mockAlertUrlData = {
    item: {
      value: JSON.stringify({
        url: 'http://example.com'
      })
    }
  };

  beforeEach(() => {
    mockStorageConnection = {
      getConfig: jest.fn()
    };
    getStorageConnection.mockReturnValue(mockStorageConnection);
    EmailService.transporter = null; // Reset transporter before each test
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {}); // Mock console.error
    jest.spyOn(console, 'log').mockImplementation(() => {}); // Mock console.log

    // Updated mock implementation based on key
    mockStorageConnection.getConfig.mockImplementation((key) => {
      if (key === 'emailIntegration') {
        return Promise.resolve(mockConfig);
      }
      if (key === 'alertUrl') {
        return Promise.resolve(mockAlertUrlData);
      }
      return Promise.resolve(null);
    });
  });

  it('should successfully send an email alert', async () => {
    const mockTransporter = {
      sendMail: jest.fn().mockResolvedValue({})
    };
    nodemailer.createTransport.mockReturnValue(mockTransporter);

    const result = await EmailService.sendAlert('Test message', 'Test type', { appName: 'TestApp', environmentName: 'TestEnv' });

    // Updated 'html' expectation using regex
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
    mockStorageConnection.getConfig.mockImplementation((key) => {
      if (key === 'emailIntegration') {
        throw new Error('Unexpected error');
      }
      return Promise.resolve(null);
    });

    const result = await EmailService.sendAlert('Test message', 'Test type', {});
    expect(console.error).toHaveBeenCalledWith('Failed to create email transporter: ', expect.any(Error));
    expect(result).toBe(false);
  });

  it('should handle missing email configuration', async () => {
    mockStorageConnection.getConfig.mockImplementation((key) => {
      if (key === 'emailIntegration') {
        return Promise.resolve(null);
      }
      return Promise.resolve(null);
    });

    const result = await EmailService.sendAlert('Test message', 'Test type', {});
    expect(result).toBe(false);
  });

  it('should handle email integration disabled', async () => {
    // Update mock to disable email integration
    mockStorageConnection.getConfig.mockImplementation((key) => {
      if (key === 'emailIntegration') {
        return Promise.resolve({
          item: {
            value: JSON.stringify({
              status: false
            })
          }
        });
      }
      if (key === 'alertUrl') {
        return Promise.resolve(mockAlertUrlData);
      }
      return Promise.resolve(null);
    });

    const result = await EmailService.sendAlert('Test message', 'Test type', {});
    expect(result).toBe(false); // Expecting result to be false when email integration is disabled.
  });

  it('should construct email with appName and environmentName', async () => {
    const mockTransporter = {
      sendMail: jest.fn().mockResolvedValue({})
    };
    nodemailer.createTransport.mockReturnValue(mockTransporter);

    const result = await EmailService.sendAlert('Test message', 'Test type', { appName: 'TestApp', environmentName: 'TestEnv' });

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

  it('should construct email with only environmentName', async () => {
    const mockTransporter = {
      sendMail: jest.fn().mockResolvedValue({})
    };
    nodemailer.createTransport.mockReturnValue(mockTransporter);

    const result = await EmailService.sendAlert('Test message', 'Test type', { environmentName: 'TestEnv' });

    expect(mockTransporter.sendMail).toHaveBeenCalledWith(expect.objectContaining({
      from: 'sender@example.com',
      to: 'receiver@example.com',
      subject: 'Errsole: Test type (TestEnv environment)',
      html: expect.stringMatching(
        /<p><b>Environment Name:<\/b> TestEnv<\/p><pre style="border: 1px solid #ccc; background-color: #f9f9f9; padding: 10px;">Test message<\/pre><br\/><p style="margin:0px;font-size:small"><i>Note:<ul style="margin:0px;padding:0px 5px;"><li>You will not receive another notification for this error on this server within the current hour\.<\/li><li>Errsole uses the UTC timezone in notifications\.<\/li><\/ul><\/i><\/p>/
      )
    }));
    expect(result).toBe(true);
  });

  it('should construct email without appName, environmentName, or serverName', async () => {
    const mockTransporter = {
      sendMail: jest.fn().mockResolvedValue({})
    };
    nodemailer.createTransport.mockReturnValue(mockTransporter);

    const result = await EmailService.sendAlert('Test message', 'Test type', {});

    expect(mockTransporter.sendMail).toHaveBeenCalledWith(expect.objectContaining({
      from: 'sender@example.com',
      to: 'receiver@example.com',
      subject: 'Errsole: Test type',
      html: expect.stringMatching(
        /<pre style="border: 1px solid #ccc; background-color: #f9f9f9; padding: 10px;">Test message<\/pre><br\/><p style="margin:0px;font-size:small"><i>Note:<ul style="margin:0px;padding:0px 5px;"><li>You will not receive another notification for this error on this server within the current hour\.<\/li><li>Errsole uses the UTC timezone in notifications\.<\/li><\/ul><\/i><\/p>/
      )
    }));
    expect(result).toBe(true);
  });

  it('should handle email send timeout', async () => {
    jest.setTimeout(15000); // Increase the timeout for this test case

    const mockTransporter = {
      sendMail: jest.fn(() => new Promise((resolve, reject) => setTimeout(() => reject(new Error('Email send timed out')), 2000))) // Shorter delay
    };
    nodemailer.createTransport.mockReturnValue(mockTransporter);

    const result = await EmailService.sendAlert('Test message', 'Test type', { appName: 'TestApp', environmentName: 'TestEnv' });
    expect(result).toBe(false);
  });

  it('should send email successfully before timeout', async () => {
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

  it('should include todayCount message for Alert type in the email content', async () => {
    const messageExtraInfo = {
      appName: 'TestApp',
      environmentName: 'TestEnv'
    };
    const todayCount = 3; // Example count

    const mockTransporter = {
      sendMail: jest.fn().mockResolvedValue({})
    };
    nodemailer.createTransport.mockReturnValue(mockTransporter);

    const result = await EmailService.sendAlert('Test message', 'Alert', messageExtraInfo, '12345', todayCount);

    expect(mockTransporter.sendMail).toHaveBeenCalledWith(expect.objectContaining({
      from: 'sender@example.com',
      to: 'receiver@example.com',
      subject: 'Errsole: Alert (TestApp app, TestEnv environment)',
      html: expect.stringContaining(`This alert has occurred <b>${todayCount} times today</b>.`)
    }));
    expect(result).toBe(true); // Verify successful sending
  });

  it('should include todayCount message for Uncaught Exception type in the email content', async () => {
    const messageExtraInfo = {
      appName: 'TestApp',
      environmentName: 'TestEnv'
    };
    const todayCount = 5; // Example count

    const mockTransporter = {
      sendMail: jest.fn().mockResolvedValue({})
    };
    nodemailer.createTransport.mockReturnValue(mockTransporter);

    const result = await EmailService.sendAlert('Test message', 'Uncaught Exception', messageExtraInfo, '12345', todayCount);

    expect(mockTransporter.sendMail).toHaveBeenCalledWith(expect.objectContaining({
      from: 'sender@example.com',
      to: 'receiver@example.com',
      subject: 'Errsole: Uncaught Exception (TestApp app, TestEnv environment)',
      html: expect.stringContaining(`This error has occurred <b>${todayCount} times today</b>.`)
    }));
    expect(result).toBe(true); // Verify successful sending
  });

  it('should correctly handle singular form for todayCount in the email content', async () => {
    const messageExtraInfo = {
      appName: 'TestApp',
      environmentName: 'TestEnv'
    };
    const todayCount = 1; // Singular count

    const mockTransporter = {
      sendMail: jest.fn().mockResolvedValue({})
    };
    nodemailer.createTransport.mockReturnValue(mockTransporter);

    // Test with type 'Alert'
    const alertResult = await EmailService.sendAlert('Test message', 'Alert', messageExtraInfo, '12345', todayCount);

    expect(mockTransporter.sendMail).toHaveBeenCalledWith(expect.objectContaining({
      from: 'sender@example.com',
      to: 'receiver@example.com',
      subject: 'Errsole: Alert (TestApp app, TestEnv environment)',
      html: expect.stringContaining(`This alert has occurred <b>${todayCount} time today</b>.`)
    }));
    expect(alertResult).toBe(true); // Verify successful sending

    // Reset mocks for the next assertion
    jest.clearAllMocks();

    // Re-apply the mock implementation in beforeEach
    mockStorageConnection.getConfig.mockImplementation((key) => {
      if (key === 'emailIntegration') {
        return Promise.resolve(mockConfig);
      }
      if (key === 'alertUrl') {
        return Promise.resolve(mockAlertUrlData);
      }
      return Promise.resolve(null);
    });

    // Test with type 'Uncaught Exception'
    const exceptionResult = await EmailService.sendAlert('Test message', 'Uncaught Exception', messageExtraInfo, '12345', todayCount);

    expect(mockTransporter.sendMail).toHaveBeenCalledWith(expect.objectContaining({
      from: 'sender@example.com',
      to: 'receiver@example.com',
      subject: 'Errsole: Uncaught Exception (TestApp app, TestEnv environment)',
      html: expect.stringContaining(`This error has occurred <b>${todayCount} time today</b>.`)
    }));
    expect(exceptionResult).toBe(true); // Verify successful sending
  });

  it('should not include todayCount message in the email content when todayCount is not provided', async () => {
    const messageExtraInfo = {
      appName: 'TestApp',
      environmentName: 'TestEnv'
    };

    const mockTransporter = {
      sendMail: jest.fn().mockResolvedValue({})
    };
    nodemailer.createTransport.mockReturnValue(mockTransporter);

    const result = await EmailService.sendAlert('Test message', 'Alert', messageExtraInfo, '12345');

    expect(mockTransporter.sendMail).toHaveBeenCalledWith(expect.objectContaining({
      from: 'sender@example.com',
      to: 'receiver@example.com',
      subject: 'Errsole: Alert (TestApp app, TestEnv environment)',
      html: expect.not.stringContaining('This alert has occurred')
    }));
    expect(result).toBe(true); // Verify successful sending
  });

  it('should log error and return false when transporter initialization fails', async () => {
    const mockStorageConnection = {
      getConfig: jest.fn().mockResolvedValue(mockConfig)
    };
    getStorageConnection.mockReturnValue(mockStorageConnection);

    // Mock nodemailer.createTransport to throw an error
    nodemailer.createTransport.mockImplementation(() => {
      throw new Error('Transporter initialization failed');
    });

    // Spy on console.error
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const result = await EmailService.sendAlert('Test message', 'Test type', {});

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Failed to create email transporter: ',
      expect.any(Error)
    );
    expect(result).toBe(false);

    // Restore the spy
    consoleErrorSpy.mockRestore();
  });

  // it('should log error and return false when sending email fails', async () => {
  //   const mockStorageConnection = {
  //     getConfig: jest.fn().mockResolvedValue(mockConfig)
  //   };
  //   getStorageConnection.mockReturnValue(mockStorageConnection);

  //   // Mock transporter and sendMail to reject
  //   const mockTransporter = {
  //     sendMail: jest.fn().mockRejectedValue(new Error('Email send failed'))
  //   };
  //   nodemailer.createTransport.mockReturnValue(mockTransporter);

  //   // Spy on console.error
  //   const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

  //   const result = await EmailService.sendAlert('Test message', 'Test type', {});

  //   expect(mockTransporter.sendMail).toHaveBeenCalled();
  //   expect(consoleErrorSpy).toHaveBeenCalledWith(
  //     'Failed to send email alert:',
  //     expect.any(Error)
  //   );
  //   expect(result).toBe(false);

  //   // Restore the spy
  //   consoleErrorSpy.mockRestore();
  // });

  it('should log error and return false when retrieving configuration fails', async () => {
    const mockStorageConnection = {
      getConfig: jest.fn().mockRejectedValue(new Error('Configuration retrieval failed'))
    };
    getStorageConnection.mockReturnValue(mockStorageConnection);

    // Spy on console.error
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const result = await EmailService.sendAlert('Test message', 'Test type', {});

    expect(mockStorageConnection.getConfig).toHaveBeenCalledWith('emailIntegration');
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Failed to create email transporter: ',
      expect.any(Error)
    );
    expect(result).toBe(false);

    // Restore the spy
    consoleErrorSpy.mockRestore();
  });

  it('should log unexpected errors and return false', async () => {
    const mockStorageConnection = {
      getConfig: jest.fn().mockResolvedValue(mockConfig)
    };
    getStorageConnection.mockReturnValue(mockStorageConnection);

    // Mock transporter and sendMail to throw a non-standard error
    const mockTransporter = {
      sendMail: jest.fn(() => { throw new Error('Unexpected error'); })
    };
    nodemailer.createTransport.mockReturnValue(mockTransporter);

    // Spy on console.error
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const result = await EmailService.sendAlert('Test message', 'Test type', {});

    expect(mockTransporter.sendMail).toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Failed to send email alert:',
      expect.any(Error)
    );
    expect(result).toBe(false);

    // Restore the spy
    consoleErrorSpy.mockRestore();
  });
});
