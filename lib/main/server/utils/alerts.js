const { getStorageConnection } = require('../storageConnection');
const axios = require('axios');

exports.customLoggerAlert = async function (message) {
  await slackAlert(message, 'Alert');
};

exports.handleUncaughtExceptions = async function (message) {
  await slackAlert(message, 'Uncaught Exception');
};

async function slackAlert (message, type) {
  try {
    const storageConnection = getStorageConnection();
    const data = await storageConnection.getConfig('slackIntegration');
    if (data && data.item) {
      let parsedValue;
      try {
        parsedValue = JSON.parse(data.item.value);
      } catch (parseError) {
        console.error('Failed to parse slack integration config:', parseError);
        return;
      }
      const webhookUrl = parsedValue.url;
      const payload = blockKit(message, type);
      await axios.post(webhookUrl, payload);
    }
  } catch (error) {
    console.error('Failed to send slack alert:', error);
  }
}

function blockKit (message, type) {
  const payload = {
    username: 'Errsole',
    icon_url: 'https://avatars.slack-edge.com/2023-07-28/5657054462980_ff9923f750585fee6a4b_192.jpg',
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
