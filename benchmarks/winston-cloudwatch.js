const express = require('express');
const { createLogger } = require('winston');
const WinstonCloudWatch = require('winston-cloudwatch');

const logger = createLogger({
  transports: [
    new WinstonCloudWatch({
      logGroupName: 'benchmark',
      logStreamName: 'winston',
      awsRegion: 'us-east-1',
      jsonMessage: true
    })
  ]
});

const app = express();

app.get('/', (req, res) => {
  logger.info('Hello World');
  res.send('Hello World');
});

const PORT = 3000;
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
