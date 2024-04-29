const { getStorageConnection } = require('../storageConnection');
const axios = require('axios');

exports.customLoggerAlert = async function (message) {
  await slackAlert(message);
};

exports.handleUncaughtExceptions = async function (message) {
  await slackAlert(message);
};

async function slackAlert (message) {
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
      await axios.post(webhookUrl, { text: message });
    }
  } catch (error) {
    console.error('Failed to send slack alert:', error);
  }
}
