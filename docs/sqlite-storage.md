# Errsole with SQLite

SQLite stores databases as files. So, if you use SQLite to store logs, those logs will be stored as a file on the storage system.

### Install

Install the `errsole` and `errsole-sqlite` modules using the npm install command:

```bash
npm install errsole errsole-sqlite
```

### Configure

```javascript
// CommonJS
const errsole = require('errsole');
const ErrsoleSQLite = require('errsole-sqlite');
```

```javascript
// ESM and TypeScript
import errsole from 'errsole';
import ErrsoleSQLite from 'errsole-sqlite';
```

```javascript
// Insert the Errsole code snippet at the beginning of your app's main file
errsole.initialize({
  storage: new ErrsoleSQLite('path/to/database.sqlite')
});
```

#### Example

```javascript
const express = require('express');
const errsole = require('errsole');
const ErrsoleSQLite = require('errsole-sqlite');

// Insert the Errsole code snippet at the beginning of your app's main file
errsole.initialize({
  storage: new ErrsoleSQLite('/tmp/logs.sqlite')
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
const ErrsoleSQLite = require('errsole-sqlite');

// Insert the Errsole code snippet at the beginning of your app's main file
errsole.initialize({
  storage: new ErrsoleSQLite('/tmp/logs.sqlite', { tablePrefix: 'helloworld' })
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
