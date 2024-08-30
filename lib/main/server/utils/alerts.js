const { getStorageConnection } = require('../storageConnection');
const axios = require('axios');
const nodemailer = require('nodemailer');

// Improved handling by adding return statements and catching exceptions
exports.customLoggerAlert = async function (message, messageExtraInfo, errsoleLogId) {
  try {
    await SlackService.sendAlert(message, 'Alert', messageExtraInfo, errsoleLogId);
    await EmailService.sendAlert(message, 'Alert', messageExtraInfo, errsoleLogId);
    return true; // Successfully sent alerts
  } catch (error) {
    console.error('Error in customLoggerAlert:', error);
    return false; // Indicate failure
  }
};

exports.handleUncaughtExceptions = async function (message, messageExtraInfo, errsoleLogId) {
  try {
    await SlackService.sendAlert(message, 'Uncaught Exception', messageExtraInfo, errsoleLogId);
    await EmailService.sendAlert(message, 'Uncaught Exception', messageExtraInfo, errsoleLogId);
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

SlackService.sendAlert = async function (message, type, messageExtraInfo, errsoleLogId) {
  try {
    const storageConnection = getStorageConnection();
    const data = await storageConnection.getConfig('slackIntegration');
    if (data && data.item) {
      const parsedValue = JSON.parse(data.item.value);
      if (parsedValue.status === false) {
        console.log('Slack integration is disabled.');
        return false; // Slack integration is disabled
      }
      // create alert url
      const alertUrlData = await storageConnection.getConfig('alertUrl');
      let alertUrl;
      if (alertUrlData && alertUrlData.item && errsoleLogId) {
        const parsedAlertUrlValue = JSON.parse(alertUrlData.item.value);
        alertUrl = parsedAlertUrlValue.url + '#/logs?errsole_log_id=' + errsoleLogId + '&timestamp=' + new Date(new Date().getTime() + 1000).toISOString();
      }
      const webhookUrl = parsedValue.url;
      const payload = blockKit(message, type, messageExtraInfo, alertUrl);

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

function blockKit (message, type, messageExtraInfo = {}, alertUrl) {
  const payload = {
    blocks: []
  };
  payload.blocks.push({ type: 'section', text: { type: 'mrkdwn', text: ' :warning: *Errsole: ' + type + '*' } });
  if (messageExtraInfo.appName) {
    payload.blocks.push({ type: 'rich_text', elements: [{ type: 'rich_text_section', elements: [{ type: 'text', text: 'App Name: ', style: { bold: true } }, { type: 'text', text: messageExtraInfo.appName + ' app' }] }] });
  }
  if (messageExtraInfo.environmentName) {
    payload.blocks.push({ type: 'rich_text', elements: [{ type: 'rich_text_section', elements: [{ type: 'text', text: 'Environment Name: ', style: { bold: true } }, { type: 'text', text: messageExtraInfo.environmentName + ' environment' }] }] });
  }
  if (messageExtraInfo.serverName) {
    payload.blocks.push({ type: 'rich_text', elements: [{ type: 'rich_text_section', elements: [{ type: 'text', text: 'Server Name: ', style: { bold: true } }, { type: 'text', text: messageExtraInfo.serverName }] }] });
  }
  payload.blocks.push({ type: 'rich_text', elements: [{ type: 'rich_text_preformatted', elements: [{ type: 'text', text: message }] }] });
  if (alertUrl) {
    payload.blocks.push({ type: 'section', text: { type: 'mrkdwn', text: '*<' + alertUrl + '|Click here> to view log in Errsole dashboard*' } });
    payload.blocks.push({ type: 'divider' });
  }
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

EmailService.sendAlert = async function (message, type, messageExtraInfo, errsoleLogId) {
  try {
    await EmailService.emailTransport(); // Ensure transporter is ready
    if (this.transporter !== null) {
      const storageConnection = getStorageConnection();
      const data = await storageConnection.getConfig('emailIntegration');
      if (data && data.item) {
        const parsedValue = JSON.parse(data.item.value);
        if (parsedValue.status === false) {
          console.log('Email integration is disabled.');
          return false; // Email integration is disabled
        }
        // create alert url
        const alertUrlData = await storageConnection.getConfig('alertUrl');
        let alertUrl;
        if (alertUrlData && alertUrlData.item && errsoleLogId) {
          const parsedAlertUrlValue = JSON.parse(alertUrlData.item.value);
          alertUrl = parsedAlertUrlValue.url + '#/logs?errsole_log_id=' + errsoleLogId + '&timestamp=' + new Date(new Date().getTime() + 1000).toISOString();
        }
        // Construct the email subject and message
        let subject;
        let messagePrefix = '';
        if (messageExtraInfo.appName && messageExtraInfo.environmentName) {
          subject = `Errsole: ${type} (${messageExtraInfo.appName} app, ${messageExtraInfo.environmentName} environment)`;
          messagePrefix = `<p><b>App Name: ${messageExtraInfo.appName}\nEnvironment Name: ${messageExtraInfo.environmentName}</b></p>`;
        } else {
          if (messageExtraInfo.appName) {
            subject = `Errsole: ${type} (${messageExtraInfo.appName} app)`;
            messagePrefix = `<p><b>App Name: ${messageExtraInfo.appName}</b></p>`;
          } else if (messageExtraInfo.environmentName) {
            subject = `Errsole: ${type} (${messageExtraInfo.environmentName} environment)`;
            messagePrefix = `<p><b>Environment Name: ${messageExtraInfo.environmentName}</b></p>`;
          } else {
            subject = `Errsole: ${type}`;
          }
        }

        if (messageExtraInfo.serverName) {
          messagePrefix += `<p><b>Server Name: ${messageExtraInfo.serverName}</b></p>`;
        }

        // Prepend additional info to the message if present
        if (messagePrefix !== '') {
          message = `${messagePrefix}<br/><pre style="border: 1px solid #ccc; background-color: #f9f9f9; padding: 10px;">${message}</pre>`;
        }

        if (alertUrl) {
          message = `${message}<br/><a href="${alertUrl}">Click here</a> to view logs in Errsole dashboard<br/><br/>`;
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
exports.SlackService = SlackService;
exports.EmailService = EmailService;
