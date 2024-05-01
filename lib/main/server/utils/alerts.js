const { getStorageConnection } = require('../storageConnection');
const axios = require('axios');
const nodemailer = require('nodemailer');

exports.customLoggerAlert = async function (message) {
  await SlackService.sendAlert(message, 'Alert');
  await EmailService.sendAlert(message, 'Alert');
};

exports.handleUncaughtExceptions = async function (message) {
  await SlackService.sendAlert(message, 'Uncaught Exception');
  await EmailService.sendAlert(message, 'Uncaught Exception');
};

// Slack

const SlackService = {};

SlackService.sendAlert = async function (message, type) {
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
      const payload = blockKit(message, type);

      payload.username = parsedValue.username || 'Errsole';
      payload.icon_url = parsedValue.icon_url || 'https://avatars.githubusercontent.com/u/84983840';
      await axios.post(webhookUrl, payload);
    }
  } catch (error) {
    console.error('Failed to send slack alert:', error);
  }
};

function blockKit (message, type) {
  const payload = {
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: ' :warning: *' + type + '*'
        }
      },
      {
        type: 'rich_text',
        elements: [
          {
            type: 'rich_text_preformatted',
            elements: [
              {
                type: 'text',
                text: message
              }
            ]
          }
        ]
      },
      {
        type: 'divider'
      }
    ]
  };
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

EmailService.sendAlert = async function (message, type) {
  try {
    await EmailService.emailTransport();
    if (this.transporter !== null) {
      const storageConnection = getStorageConnection();
      const data = await storageConnection.getConfig('emailIntegration');
      if (data && data.item) {
        const parsedValue = JSON.parse(data.item.value);
        await this.transporter.sendMail({
          from: parsedValue.sender,
          to: parsedValue.receivers,
          subject: 'Errsole: ' + type,
          text: message
        });
      }
    }
  } catch (error) {}
};
