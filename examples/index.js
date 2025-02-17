/** This file sets up an example Node.js application with the Errsole open-source.
  * It includes configuration for a SQLite storage system via the errsole-sequelize package.
  * Additionally, it defines routes and a logging mechanism using Express.js, showcasing both standard and custom logging functionality.
  * Furthermore, an interval logs random phrases every 5 seconds, helping logging features.
*/

const errsole = require('../lib/errsole.js');
const ErrsoleSQLite = require('errsole-sqlite');

errsole.initialize({
  storage: new ErrsoleSQLite('logs1098.sqlite')
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

const meta = { user: { name: 'John Doe', age: 35, email: 'johndoe@example.com', address: { street: '123 Main St', city: 'Springfield', state: 'IL', zipCode: '62701' }, preferences: { theme: 'dark', notifications: true } }, friends: [{ name: 'Jane Smith', contact: { email: 'jane.smith@example.com', phone: '123-456-7890' }, social: [{ platform: 'Twitter', handle: '@janesmith' }, { platform: 'LinkedIn', handle: 'linkedin.com/in/janesmith' }] }, { name: 'Michael Johnson', contact: { email: 'michael.johnson@example.com', phone: '987-654-3210' }, social: [{ platform: 'Twitter', handle: '@michaeljohnson' }, { platform: 'Instagram', handle: '@mikejohn' }] }], company: { name: 'TechCorp', address: { street: '456 Tech Blvd', city: 'Metropolis', state: 'NY', zipCode: '10001' }, departments: [{ name: 'Engineering', employees: [{ name: 'Alice Cooper', role: 'Lead Engineer' }, { name: 'Bob Brown', role: 'Software Engineer' }] }, { name: 'Marketing', employees: [{ name: 'Carol White', role: 'Marketing Manager' }, { name: 'David Green', role: 'Content Strategist' }] }] }, hobbies: [{ name: 'Photography', level: 'Intermediate' }, { name: 'Cycling', level: 'Beginner' }, { name: 'Cooking', level: 'Advanced' }] };

setInterval(function () {
  const time = Math.floor(Math.random() * (4000 - 700 + 1) + 1300);
  errsole.log(generateRandomLine(50) + ' ' + time);
  errsole.error(generateRandomLine(50) + ' ' + time);
  errsole.meta(meta).error(generateRandomLine(50) + ' ' + time);
}, 5000);

const port = 9000;

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
