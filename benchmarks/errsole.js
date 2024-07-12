const app = require('express')();

const errsole = require('errsole');
const ErrsoleMySQL = require('errsole-mysql');
errsole.initialize({
  storage: new ErrsoleMySQL({
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

app.listen(3000);
