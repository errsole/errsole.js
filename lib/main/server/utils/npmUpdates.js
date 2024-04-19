const axios = require('axios');

const NPMUpdates = { };

NPMUpdates.fetchLatestVersion = async function (packageName) {
  const npmResponse = await axios({
    method: 'get',
    url: 'https://registry.npmjs.org/' + packageName + '/latest'
  });

  if (npmResponse.status === 200 && npmResponse.data) {
    if (npmResponse.data.version) {
      return npmResponse.data.version;
    } else {
      return '0.0.0';
    }
  } else {
    throw new Error('badRequest');
  }
};

module.exports = NPMUpdates;
