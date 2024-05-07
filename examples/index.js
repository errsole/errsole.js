/** This file sets up an example Node.js application with the Errsole open-source.
  * It includes configuration for a SQLite storage system via the errsole-sequelize package.
  * Additionally, it defines routes and a logging mechanism using Express.js, showcasing both standard and custom logging functionality.
  * Furthermore, an interval logs random phrases every 5 seconds, helping logging features.
*/

const errsole = require('../lib/errsole.js');
const ErrsoleSequelize = require('errsole-sequelize');

errsole.initialize({
  storage: new ErrsoleSequelize({
    dialect: 'sqlite',
    storage: 'database.sqlite'
  })
});

const express = require('express');
const app = express();

app.use('/errsole', errsole.expressProxyMiddleware());

app.get('/ping', function (req, res) {
  res.send('ping');
});

app.get('/random', function (req, res) {
  const random = Math.floor(Math.random() * (4000 - 700 + 1) + 1300);
  console.log(generateRandomLine(10) + ' ' + random);
  console.error(generateRandomLine(10) + ' ' + random);
  res.send('random');
});

function generateRandomLine (wordCount) {
  const words = ['apple', 'banana', 'cherry', 'date', 'elderberry', 'fig', 'grape', 'honeydew', 'kiwi', 'lemon', 'mango', 'nectarine', 'orange', 'papaya', 'quince', 'raspberry', 'strawberry', 'tangerine', 'ugli', 'vanilla', 'watermelon', 'xigua', 'yam', 'zucchini'];
  let sentence = '';
  for (let i = 0; i < wordCount; i++) {
    const randomIndex = Math.floor(Math.random() * words.length);
    sentence += words[randomIndex] + ' ';
  }
  return sentence.trim();
}

setInterval(function () {
  const time = Math.floor(Math.random() * (4000 - 700 + 1) + 1300);
  errsole.log(generateRandomLine(50) + ' ' + time);
  errsole.error(generateRandomLine(50) + ' ' + time);
}, 5000);

const port = 9000;

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
