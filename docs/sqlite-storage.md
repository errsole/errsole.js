# Errsole with Sqlite

### Install

Install the errsole, errsole-sequelize and sqlite modules using the npm install command:

```bash
npm install errsole errsole-sequelize sqlite3
```

### Configure

```javascript
/**
 * Insert this Errsole code snippet as the first line of your app's main file
 */
    const errsole = require('errsole');
    const ErrsoleSequelize = require('errsole-sequelize');
    // or using ESM
    // import errsole from 'errsole';
    // import ErrsoleSequelize from 'errsole-sequelize';

    errsole.initialize({
      storage: new ErrsoleSequelize({
        dialect: 'sqlite', // This specifies that you are using Sqlite
        storage: 'path/to/database.sqlite'
      },
      port: 8001, // Optional: Specify the dashboard port, default is 8001
      path: '/',  // Optional: Specify the dashboard base path, default is '/'
      captureLogs: ['info', 'error'], // Optional: Specify which logs to capture, default is ['info', 'error']
      enableConsoleOutput: true // Optional: Set to false to prevent logs from printing in the terminal, default is true
    });
// End of Errsole code snippet
```

#### Example

```javascript
/**
 * Insert this Errsole code snippet as the first line of your app's main file
 */
const errsole = require('errsole');
const ErrsoleSequelize = require('errsole-sequelize');

errsole.initialize({
  storage: new ErrsoleSequelize({
    dialect: 'sqlite',
    storage: 'path/to/database.sqlite'
  })
});
// Errsole setup (as shown above)

const express = require('express');
const app = express();


app.get('/', (req, res) => {
  res.send('Hello World');
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
```

### Web Dashboard

After the setup, access the Errsole Web Dashboard at [http://localhost:8001/](http://localhost:8001/). If you have configured Errsole with a different port and path during initialization, remember to replace "8001" in the URL with your chosen port number and add your custom path to the end of the URL.

### Main Documentation

[Main Documentation](/README.md)
