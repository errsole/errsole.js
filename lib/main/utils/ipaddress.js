const os = require('os');

exports.getLocalIP = () => {
  const networkInterfaces = os.networkInterfaces();
  for (const interfaceDetails of Object.values(networkInterfaces)) {
    if (!interfaceDetails) continue;
    const result = interfaceDetails.find(details => {
      return details.family === 'IPv4' && !details.internal;
    });
    if (result) {
      return result.address;
    }
  }
};
