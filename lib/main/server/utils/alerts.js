const { getStorageConnection } = require('../storageConnection');
const axios = require('axios');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Improved handling by adding return statements and catching exceptions
exports.customLoggerAlert = async function (message, messageExtraInfo, errsoleLogId, timestamp) {
  try {
    // check for duplicate notifications
    const { isDuplicateAlert, todayCount } = await checkAlertStatus(message, messageExtraInfo, errsoleLogId);
    if (isDuplicateAlert) {
      return false;
    }
    await SlackService.sendAlert(message, 'Alert', messageExtraInfo, errsoleLogId, todayCount, timestamp);
    await EmailService.sendAlert(message, 'Alert', messageExtraInfo, errsoleLogId, todayCount, timestamp);
    return true;
  } catch (error) {
    console.error('Error in customLoggerAlert:', error);
    return false;
  }
};

exports.handleUncaughtExceptions = async function (message, messageExtraInfo, errsoleLogId, timestamp) {
  try {
    // check for duplicate notifications
    const { isDuplicateAlert, todayCount } = await checkAlertStatus(message, messageExtraInfo, errsoleLogId);
    if (isDuplicateAlert) {
      return false;
    }
    await SlackService.sendAlert(message, 'Uncaught Exception', messageExtraInfo, errsoleLogId, todayCount, timestamp);
    await EmailService.sendAlert(message, 'Uncaught Exception', messageExtraInfo, errsoleLogId, todayCount, timestamp);
    return true; // Successfully handled exception
  } catch (error) {
    console.error('Error in handleUncaughtExceptions:', error);
    return false; // Indicate failure
  }
};

exports.testSlackAlert = async function (message, messageExtraInfo) {
  try {
    const result = await SlackService.sendAlert(message, 'Test', messageExtraInfo);
    return result; // Successfully sent alerts
  } catch (error) {
    console.error('Error in testSlackAlert:', error);
    return false; // Indicate failure
  }
};

exports.testEmailAlert = async function (message, messageExtraInfo) {
  try {
    const result = await EmailService.sendAlert(message, 'Test', messageExtraInfo);
    return result; // Successfully sent alerts
  } catch (error) {
    console.error('Error in testEmailAlert:', error);
    return false; // Indicate failure
  }
};

const SlackService = {};

SlackService.sendAlert = async function (message, type, messageExtraInfo, errsoleLogId, todayCount, timestamp) {
  try {
    const storageConnection = getStorageConnection();
    const data = await storageConnection.getConfig('slackIntegration');
    if (data && data.item) {
      const parsedValue = JSON.parse(data.item.value);
      if (parsedValue.status === false) {
        return false; // Slack integration is disabled
      }
      // create alert url
      const alertUrlData = await storageConnection.getConfig('alertUrl');
      let alertUrl;
      if (alertUrlData && alertUrlData.item && errsoleLogId) {
        const parsedAlertUrlValue = JSON.parse(alertUrlData.item.value);
        let alertTimestap;
        if (!timestamp) {
          alertTimestap = new Date(new Date().getTime() + 2000).toISOString();
        } else {
          alertTimestap = roundUpToNextSecond(timestamp);
          alertTimestap = alertTimestap.toISOString();
        }
        alertUrl = parsedAlertUrlValue.url + '#/logs?errsole_log_id=' + errsoleLogId + '&timestamp=' + alertTimestap;
      }
      const webhookUrl = parsedValue.url;
      const payload = blockKit(message, type, messageExtraInfo, alertUrl, todayCount);

      payload.username = parsedValue.username || 'Errsole';
      payload.icon_url = parsedValue.icon_url || 'https://avatars.githubusercontent.com/u/84983840';

      const slackPromise = axios.post(webhookUrl, payload);
      const timeoutPromise = new Promise((resolve, reject) => {
        setTimeout(() => {
          reject(new Error('Slack send timed out'));
        }, 5000);
      });

      try {
        await Promise.race([slackPromise, timeoutPromise]);
      } catch (error) { return false; }
      return true; // Successfully sent Slack alert
    }
    return false; // No config found
  } catch (error) {
    console.error('Failed to send slack alert:', error);
    return false; // Indicate failure
  }
};

function blockKit (message, type, messageExtraInfo = {}, alertUrl, todayCount) {
  const payload = {
    blocks: []
  };
  payload.blocks.push({ type: 'section', text: { type: 'mrkdwn', text: ' :warning: *Errsole: ' + type + '*' } });
  if (messageExtraInfo.appName) {
    payload.blocks.push({ type: 'rich_text', elements: [{ type: 'rich_text_section', elements: [{ type: 'text', text: 'App Name: ', style: { bold: true } }, { type: 'text', text: messageExtraInfo.appName }] }] });
  }
  if (messageExtraInfo.environmentName) {
    payload.blocks.push({ type: 'rich_text', elements: [{ type: 'rich_text_section', elements: [{ type: 'text', text: 'Environment Name: ', style: { bold: true } }, { type: 'text', text: messageExtraInfo.environmentName }] }] });
  }
  if (messageExtraInfo.serverName) {
    payload.blocks.push({ type: 'rich_text', elements: [{ type: 'rich_text_section', elements: [{ type: 'text', text: 'Server Name: ', style: { bold: true } }, { type: 'text', text: messageExtraInfo.serverName }] }] });
  }
  payload.blocks.push({ type: 'rich_text', elements: [{ type: 'rich_text_preformatted', elements: [{ type: 'text', text: message }] }] });
  if (todayCount) {
    if (type === 'Alert') {
      payload.blocks.push({ type: 'section', text: { type: 'mrkdwn', text: `This alert has occurred *${todayCount} time${todayCount > 1 ? 's' : ''} today*.` } });
    } else {
      payload.blocks.push({ type: 'section', text: { type: 'mrkdwn', text: `This error has occurred *${todayCount} time${todayCount > 1 ? 's' : ''} today*.` } });
    }
  }
  if (alertUrl) {
    payload.blocks.push({ type: 'section', text: { type: 'mrkdwn', text: '<' + alertUrl + '|Click here> to view the logs in the Errsole dashboard.' } });
  }
  // Add notice
  if (type === 'Alert') {
    payload.blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '_Note:_\n• _You will not receive another notification for this alert on this server within the current hour._\n• _Errsole uses the UTC timezone in notifications._'
      }
    });
  } else if (type !== 'Test') {
    payload.blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '_Note:_\n• _You will not receive another notification for this error on this server within the current hour._\n• _Errsole uses the UTC timezone in notifications._'
      }
    });
  }
  payload.blocks.push({ type: 'divider' });
  return payload;
}

// Email Service with better error handling and defaults
const EmailService = {
  transporter: null
};

EmailService.emailTransport = async function () {
  try {
    if (this.transporter === null) {
      const storageConnection = getStorageConnection();
      const data = await storageConnection.getConfig('emailIntegration');
      if (data && data.item) {
        const parsedValue = JSON.parse(data.item.value);
        this.transporter = nodemailer.createTransport({
          pool: true,
          maxConnections: 5,
          maxMessages: 100,
          rateLimit: 10,
          host: parsedValue.host,
          port: parseInt(parsedValue.port),
          secure: parseInt(parsedValue.port) === 465,
          auth: {
            user: parsedValue.username,
            pass: parsedValue.password
          }
        });
      }
    }
  } catch (error) {
    console.error('Failed to create email transporter: ', error);
    // Return null transporter to indicate error
    this.transporter = null;
  }
};

EmailService.sendAlert = async function (message, type, messageExtraInfo, errsoleLogId, todayCount, timestamp) {
  try {
    await EmailService.emailTransport(); // Ensure transporter is ready
    if (this.transporter !== null) {
      const storageConnection = getStorageConnection();
      const data = await storageConnection.getConfig('emailIntegration');
      if (data && data.item) {
        const parsedValue = JSON.parse(data.item.value);
        if (parsedValue.status === false) {
          return false; // Email integration is disabled
        }
        // create alert url
        const alertUrlData = await storageConnection.getConfig('alertUrl');
        let alertUrl;
        if (alertUrlData && alertUrlData.item && errsoleLogId) {
          const parsedAlertUrlValue = JSON.parse(alertUrlData.item.value);
          let alertTimestap;
          if (!timestamp) {
            alertTimestap = new Date(new Date().getTime() + 2000).toISOString();
          } else {
            alertTimestap = roundUpToNextSecond(timestamp);
            alertTimestap = alertTimestap.toISOString();
          }
          alertUrl = parsedAlertUrlValue.url + '#/logs?errsole_log_id=' + errsoleLogId + '&timestamp=' + alertTimestap;
        }
        // Construct the email subject and message
        let subject;
        let messagePrefix = '';
        if (messageExtraInfo.appName && messageExtraInfo.environmentName) {
          subject = `Errsole: ${type} (${messageExtraInfo.appName} app, ${messageExtraInfo.environmentName} environment)`;
          messagePrefix = `<p><b>App Name:</b> ${messageExtraInfo.appName}</p>
          <p><b>Environment Name:</b> ${messageExtraInfo.environmentName}</p>`;
        } else if (messageExtraInfo.appName) {
          subject = `Errsole: ${type} (${messageExtraInfo.appName} app)`;
          messagePrefix = `<p><b>App Name:</b> ${messageExtraInfo.appName}</p>`;
        } else if (messageExtraInfo.environmentName) {
          subject = `Errsole: ${type} (${messageExtraInfo.environmentName} environment)`;
          messagePrefix = `<p><b>Environment Name:</b> ${messageExtraInfo.environmentName}</p>`;
        } else {
          subject = `Errsole: ${type}`;
        }
        if (messageExtraInfo.serverName) {
          messagePrefix += `<p><b>Server Name:</b> ${messageExtraInfo.serverName}</p>`;
        }
        message = `${messagePrefix}<pre style="border: 1px solid #ccc; background-color: #f9f9f9; padding: 10px;">${message}</pre>`;
        if (todayCount) {
          if (type === 'Alert') {
            message = `${message}<p>This alert has occurred <b>${todayCount} time${todayCount > 1 ? 's' : ''} today</b>.</p>`;
          } else {
            message = `${message}<p>This error has occurred <b>${todayCount} time${todayCount > 1 ? 's' : ''} today</b>.</p>`;
          }
        }
        if (alertUrl) {
          message = `${message}<p><a href="${alertUrl}">Click here</a> to view the logs in the Errsole dashboard.</p>`;
        }
        // Add notice
        if (type === 'Alert') {
          message = `${message}<br/><p style="margin:0px;font-size:small"><i>Note:<ul style="margin:0px;padding:0px 5px;"><li>You will not receive another notification for this alert on this server within the current hour.</li><li>Errsole uses the UTC timezone in notifications.</li></ul></i></p>`;
        } else {
          message = `${message}<br/><p style="margin:0px;font-size:small"><i>Note:<ul style="margin:0px;padding:0px 5px;"><li>You will not receive another notification for this error on this server within the current hour.</li><li>Errsole uses the UTC timezone in notifications.</li></ul></i></p>`;
        }

        // Send the email using the prepared transporter
        const emailPromise = this.transporter.sendMail({
          from: parsedValue.sender,
          to: parsedValue.receivers,
          subject,
          html: message
        });

        const timeoutPromise = new Promise((resolve, reject) => {
          setTimeout(() => {
            reject(new Error('Email send timed out'));
          }, 5000);
        });

        try {
          await Promise.race([emailPromise, timeoutPromise]);
        } catch (error) { console.log(error); return false; }

        return true; // Successfully sent email alert
      }
    }
    return false; // No transporter available or no config found
  } catch (error) {
    console.error('Failed to send email alert:', error);
    return false; // Indicate failure
  }
};

exports.clearEmailTransport = async function () {
  EmailService.transporter = null;
  return true;
};

const checkAlertStatus = async (message, messageExtraInfo, errsoleLogId) => {
  let isDuplicateAlert = false;
  let todayCount = 0;
  // Helper function to safely stringify input
  const stringify = (input) => {
    if (typeof input === 'string') return input;
    try {
      return JSON.stringify(input);
    } catch {
      return String(input);
    }
  };

  const storageConnection = getStorageConnection();

  if (storageConnection && storageConnection.insertNotificationItem) {
    const combined = `${stringify(message)}|${stringify(messageExtraInfo)}`;
    const hashedMessage = crypto.createHash('sha256').update(combined).digest('hex');
    const notification = {
      errsole_id: errsoleLogId,
      hashed_message: hashedMessage,
      hostname: messageExtraInfo.serverName
    };

    try {
      const insertAlertResult = await storageConnection.insertNotificationItem(notification);

      if (insertAlertResult) {
        const previousItem = insertAlertResult.previousNotificationItem;
        todayCount = insertAlertResult.todayNotificationCount;

        if (previousItem) {
          const now = new Date();
          const previousTime = new Date(previousItem.created_at);

          if (
            now.getUTCFullYear() === previousTime.getUTCFullYear() &&
            now.getUTCMonth() === previousTime.getUTCMonth() &&
            now.getUTCDate() === previousTime.getUTCDate() &&
            now.getUTCHours() === previousTime.getUTCHours()
          ) {
            isDuplicateAlert = true;
          }
        }
      }
    } catch (error) {
      console.error('Error inserting notification item:', error);
      return false;
      // Handle the error as needed, e.g., rethrow or set a default value
    }
  }
  return { isDuplicateAlert, todayCount };
};

// Function to round up to the next whole second
function roundUpToNextSecond (date) {
  const roundedDate = new Date(date); // Clone to avoid mutating the original date
  if (roundedDate.getMilliseconds() > 0) {
    roundedDate.setSeconds(roundedDate.getSeconds() + 1);
    roundedDate.setMilliseconds(0);
  }
  return roundedDate;
}

exports.SlackService = SlackService;
exports.EmailService = EmailService;
