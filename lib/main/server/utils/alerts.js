const { getStorageConnection } = require('../storageConnection');
const axios = require('axios');

let webhookUrl = null;

exports.customLoggerAlert = function (level, message) {
  slackAlert(level, message);
};

async function slackAlert (level, message) {
  try {
    const storageConnection = getStorageConnection();
    const data = await storageConnection.getConfig('slackIntegration');
    if (data && data.item) {
      data.item.value = JSON.parse(data.item.value);
      webhookUrl = data.item.value.url;
      axios.post(webhookUrl, { text: message });
    }
  } catch (error) { }
}
