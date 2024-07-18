const express = require('express');
const pino = require('pino');
const pinoCloudWatch = require('pino-cloudwatch');
const AWS = require('aws-sdk');

AWS.config.update({
  region: 'us-east-1'
});

const transport = pinoCloudWatch({
  group: 'benchmark',
  stream: 'pino',
  awsRegion: 'us-east-1'
});

const logger = pino(transport);

const app = express();

app.get('/', (req, res) => {
  logger.info('Hello World');
  res.send('Hello World');
});

const PORT = 3000;
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
