const { getStorageConnection } = require('../storageConnection');
const axios = require('axios');
const nodemailer = require('nodemailer');

exports.customLoggerAlert = async function (message, messageExtraInfo) {
  await SlackService.sendAlert(message, 'Alert', messageExtraInfo);
  await EmailService.sendAlert(message, 'Alert', messageExtraInfo);
};

exports.handleUncaughtExceptions = async function (message, messageExtraInfo) {
  await SlackService.sendAlert(message, 'Uncaught Exception', messageExtraInfo);
  await EmailService.sendAlert(message, 'Uncaught Exception', messageExtraInfo);
};

// Slack

const SlackService = {};

SlackService.sendAlert = async function (message, type, messageExtraInfo) {
  try {
    const storageConnection = getStorageConnection();
    const data = await storageConnection.getConfig('slackIntegration');
    if (data && data.item) {
      let parsedValue;
      try {
        parsedValue = JSON.parse(data.item.value);
        if (parsedValue.status === false) {
          return false;
        }
      } catch (parseError) {
        console.error('Failed to parse slack integration config:', parseError);
        return;
      }
      const webhookUrl = parsedValue.url;
      const payload = blockKit(message, type, messageExtraInfo);

      payload.username = parsedValue.username || 'Errsole';
      payload.icon_url = parsedValue.icon_url || 'https://avatars.githubusercontent.com/u/84983840';
      await axios.post(webhookUrl, payload);
    }
  } catch (error) {
    console.error('Failed to send slack alert:', error);
  }
};

function blockKit (message, type, messageExtraInfo = {}) {
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

  return payload;
}

// Email
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
  }
};

EmailService.sendAlert = async function (message, type, messageExtraInfo) {
  try {
    await EmailService.emailTransport();
    if (this.transporter !== null) {
      const storageConnection = getStorageConnection();
      const data = await storageConnection.getConfig('emailIntegration');
      if (data && data.item) {
        const parsedValue = JSON.parse(data.item.value);
        if (parsedValue.status === false) {
          return false;
        }
        let subject;
        let messagePrefix = '';
        if (messageExtraInfo.appName && messageExtraInfo.environmentName) {
          subject = 'Errsole: ' + type + ' (' + messageExtraInfo.appName + ' app, ' + messageExtraInfo.environmentName + ' environment)';
          messagePrefix = 'App Name: ' + messageExtraInfo.appName + '\nEnvironment Name: ' + messageExtraInfo.environmentName;
        } else {
          if (messageExtraInfo.appName) {
            subject = 'Errsole: ' + type + ' (' + messageExtraInfo.appName + ' app)';
            messagePrefix = 'App Name: ' + messageExtraInfo.appName;
          } else if (messageExtraInfo.environmentName) {
            subject = 'Errsole: ' + type + ' (' + messageExtraInfo.appName + ' environment)';
            messagePrefix = 'Environment Name: ' + messageExtraInfo.environmentName;
          } else {
            subject = 'Errsole: ' + type;
          }
        }
        if (messageExtraInfo.serverName && messagePrefix !== '') {
          messagePrefix = messagePrefix + '\nServer Name: ' + messageExtraInfo.serverName;
        } else if (messageExtraInfo.serverName) {
          messagePrefix = 'Server Name: ' + messageExtraInfo.serverName;
        }
        if (messagePrefix !== '') {
          message = messagePrefix + '\n\n' + message;
        }
        await this.transporter.sendMail({
          from: parsedValue.sender,
          to: parsedValue.receivers,
          subject,
          text: message
        });
      }
    }
  } catch (error) {}
};
