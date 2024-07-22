const express = require('express');
const errsole = require('errsole');
const ErrsoleMongoDB = require('errsole-mongodb');

errsole.initialize({
  storage: new ErrsoleMongoDB('mongodb://admin:XXXXX.172.xx.xx.xx:27017', 'errsole')
});

const app = express();

app.get('/', function (req, res) {
  errsole.info('Hello, World');
  res.send('hello world');
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
