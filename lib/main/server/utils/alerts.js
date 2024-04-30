const { getStorageConnection } = require('../storageConnection');
const axios = require('axios');

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

exports.customLoggerAlert = async function (message) {
  await SlackService.sendAlert(message, 'Alert');
};

exports.handleUncaughtExceptions = async function (message) {
  await SlackService.sendAlert(message, 'Uncaught Exception');
};
