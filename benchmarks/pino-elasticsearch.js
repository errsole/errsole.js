const express = require('express');
const pino = require('pino');
const pinoElastic = require('pino-elasticsearch');

const streamToElastic = pinoElastic({
  index: 'logging-pino-es',
  node: 'http://172.xx.xx.xx:9200',
  auth: {
    username: 'elastic',
    password: 'xxxxxxxxxxx'
  },
  flushByte: 1000
});

const logger = pino({
  level: 'info',
  base: { pid: false },
  timestamp: pino.stdTimeFunctions.isoTime
}, streamToElastic);

const app = express();

app.get('/', (req, res) => {
  logger.info('Hello World');
  res.send('Hello World');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info('Server is running');
  console.log(`Server is running on port ${PORT}`);
});
