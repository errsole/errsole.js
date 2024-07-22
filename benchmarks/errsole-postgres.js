'use strict';

const express = require('express');
const app = express();

const errsole = require('errsole');
const ErrsolePostgres = require('errsole-postgres');
errsole.initialize({
  storage: new ErrsolePostgres({
    host: '172.xx.xx.xx',
    user: 'admin',
    password: 'xxxxxxxxxxx',
    database: 'errsole'
  })
});

app.get('/', function (req, res) {
  errsole.info('Hello, World');
  res.send('hello world');
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
