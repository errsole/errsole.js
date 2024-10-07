# Errsole with PostgreSQL

### Install

Install the `errsole` and `errsole-postgres` modules using the npm install command:

```bash
npm install errsole errsole-postgres
```

### Configure

```javascript
// CommonJS
const errsole = require('errsole');
const ErrsolePostgres = require('errsole-postgres');
```

```javascript
// ESM and TypeScript
import errsole from 'errsole';
import ErrsolePostgres from 'errsole-postgres';
```

```javascript
// Insert the Errsole code snippet at the beginning of your app's main file
errsole.initialize({
  storage: new ErrsolePostgres({
    host: 'postgres-host', // Replace with your actual PostgreSQL host
    user: 'database-user', // Replace with your actual PostgreSQL user
    password: 'database-password', // Replace with your actual PostgreSQL password
    database: 'database-name' // Replace with the name of your PostgreSQL database
  })
});
```

#### Example

```javascript
const express = require('express');
const errsole = require('errsole');
const ErrsolePostgres = require('errsole-postgres');

// Insert the Errsole code snippet at the beginning of your app's main file
errsole.initialize({
  storage: new ErrsolePostgres({
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

### Advanced Configuration

[Advanced Configuration](/docs/advanced-configuration.md)

### Web Dashboard Access

[Web Dashboard Access](/docs/web-dashboard-access.md)

### Main Documentation

[Main Documentation](/README.md)
