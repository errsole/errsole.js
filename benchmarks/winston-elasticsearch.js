const express = require('express');
const { createLogger } = require('winston');
const { ElasticsearchTransport } = require('winston-elasticsearch');
const { Client } = require('@elastic/elasticsearch');

const elasticsearchClient = new Client({
  node: 'http://172.xx.xx.xx:9200',
  auth: {
    username: 'elastic',
    password: 'xxxxxxxxxxx'
  }
});

const esTransportOpts = {
  level: 'info',
  client: elasticsearchClient,
  indexPrefix: 'logging-winston-es'
};

const esTransport = new ElasticsearchTransport(esTransportOpts);

esTransport.on('error', (error) => {
  console.error('Error in Elasticsearch transport:', error);
});

const logger = createLogger({
  transports: [
    esTransport
  ]
});

const app = express();

app.get('/', (req, res) => {
  logger.info('Hello World');
  res.send('Hello World');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
  console.log(`Server is running on port ${PORT}`);
});
