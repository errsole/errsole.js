# Winston with Errsole

If you are already using Winston for logging in your Node.js project and want to integrate it with Errsole, you can do so by using the `winston-errsole` transport. This transport streams your Winston logs to Errsole.

### Steps

1. Configure the `winston-errsole` transport in your Winston logger to stream logs to Errsole.
2. Set up Errsole to receive and store logs from your `winston-errsole` transport.

#### Example

```javascript
const winston = require('winston');
const WinstonErrsole = require('winston-errsole');
const errsole = require('errsole');
const ErrsoleSQLite = require('errsole-sqlite');

const logger = winston.createLogger({
  level: 'debug',
  transports: [new WinstonErrsole()]
});

errsole.initialize({
  storage: new ErrsoleSQLite('/tmp/logs.sqlite')
});

module.exports = logger;
```

### Errsole Setup

#### File-based Logging

* [Errsole with SQLite](https://github.com/errsole/errsole.js/blob/master/docs/sqlite-storage.md)

#### Centralized Logging

* [Errsole with MongoDB](https://github.com/errsole/errsole.js/blob/master/docs/mongodb-storage.md)
* [Errsole with MySQL](https://github.com/errsole/errsole.js/blob/master/docs/mysql-storage.md)
* [Errsole with PostgreSQL](https://github.com/errsole/errsole.js/blob/master/docs/postgresql-storage.md)

### Main Documentation

[Main Documentation](/README.md)
