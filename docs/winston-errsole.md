# Winston with Errsole

If you are already using Winston for logging in your Node.js project and want to integrate it with Errsole, you can do so by using the `winston-errsole` transport. This transport streams your Winston logs to Errsole.

## Steps

1. Add the `winston-errsole` transport in your Winston logger to stream logs to Errsole.
2. Setup Errsole to receive and store logs from your `winston-errsole` transport.

#### Example

```bash
npm install winston winston-errsole
```

```bash
npm install errsole errsole-sqlite
```

```javascript
// Add `winston-errsole` transport
const winston = require('winston');
const WinstonErrsole = require('winston-errsole');

const logger = winston.createLogger({
  level: 'debug',
  transports: [new WinstonErrsole()]
});

// Setup Errsole
const errsole = require('errsole');
const ErrsoleSQLite = require('errsole-sqlite');

errsole.initialize({
  storage: new ErrsoleSQLite('/tmp/logs.sqlite')
});

module.exports = logger;
```

## Errsole Setup

#### File-based Logging

* [Errsole with SQLite](/docs/sqlite-storage.md)

#### Centralized Logging

* [Errsole with MySQL](/docs/mysql-storage.md)
* [Errsole with PostgreSQL](/docs/postgresql-storage.md)
* [Errsole with MongoDB](/docs/mongodb-storage.md)

## Main Documentation

[Main Documentation](/README.md)
