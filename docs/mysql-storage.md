# Errsole with MySQL

### Install

Install the `errsole` and `errsole-mysql` modules using the npm install command:

```bash
npm install errsole errsole-mysql
```

### Configure

```javascript
// CommonJS
const errsole = require('errsole');
const ErrsoleMySQL = require('errsole-mysql');
```

```javascript
// ESM and TypeScript
import errsole from 'errsole';
import ErrsoleMySQL from 'errsole-mysql';
```

```javascript
// Insert the Errsole code snippet at the beginning of your app's main file
errsole.initialize({
  storage: new ErrsoleMySQL({
    host: 'mysql-host', // Replace with your actual MySQL host
    user: 'database-user', // Replace with your actual MySQL user
    password: 'database-password', // Replace with your actual MySQL password
    database: 'database-name' // Replace with the name of your MySQL database
  })
});
```

#### Example

```javascript
const express = require('express');
const errsole = require('errsole');
const ErrsoleMySQL = require('errsole-mysql');

// Insert the Errsole code snippet at the beginning of your app's main file
errsole.initialize({
  storage: new ErrsoleMySQL({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'dbname'
  })
});

const app = express();

app.get('/', function (req, res) {
  res.send('Hello World');
});

app.listen(3000);
```

To store logs from multiple apps using Errsole, assign a unique `tablePrefix` to each app. This ensures that the logs are stored separately for better organization and easy identification.

```javascript
const express = require('express');
const errsole = require('errsole');
const ErrsoleMySQL = require('errsole-mysql');

// Insert the Errsole code snippet at the beginning of your app's main file
errsole.initialize({
  storage: new ErrsoleMySQL({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'dbname',
    tablePrefix: 'helloworld'
  })
});

const app = express();

app.get('/', function (req, res) {
  res.send('Hello World');
});

app.listen(3000);
```

### Advanced Configuration

[Advanced Configuration](/docs/advanced-configuration.md)

### Web Dashboard Access

[Web Dashboard Access](/docs/web-dashboard-access.md)

### Main Documentation

[Main Documentation](/README.md)
