// In this example, the Errsole Web Dashboard will be accessible at http://localhost:3000/errsole/logs/dashboard
const errsole = require('errsole');
const ErrsoleSequelize = require('errsole-sequelize');
const express = require('express');

// Initialize Errsole with a custom path
errsole.initialize({
  storage: new ErrsoleSequelize({
    dialect: 'sqlite',
    storage: '/tmp/logs.sqlite'
  }),
  path: '/logs/dashboard' // Custom path
});

const app = express();

// Use Errsole Proxy Middleware
app.use('/errsole', errsole.proxyMiddleware());

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
