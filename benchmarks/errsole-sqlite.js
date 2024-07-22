const express = require('express');
const errsole = require('errsole');
const ErrsoleSQLite = require('errsole-sqlite');

errsole.initialize({
  storage: new ErrsoleSQLite('./logs.sqlite')
});

const app = express();

app.get('/', function (req, res) {
  errsole.info('Hello, World');
  res.send('hello world');
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
