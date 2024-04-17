# Errsole Setup

## Errsole with MongoDB

### Install

Install the errsole and errsole-mongodb modules using the npm install command:

```bash
npm install errsole errsole-mongodb
```

### Configure

```javascript
/**
 * Insert this Errsole code snippet as the first line of your app's main file
 */
const errsole = require('errsole');
const ErrsoleMongoDB = require('errsole-mongodb');

// Alternatively, if you are using ECMAScript modules (ESM), you can import the modules as follows:
// import errsole from 'errsole';
// import ErrsoleMongoDB from 'errsole-mongodb';

errsole.initialize({
  // Setup MongoDB as the storage backend with connection details.
  storage: new ErrsoleMongoDB('<MongoDB Connection URL>', '<Optional: Database Name>', '<Optional: MongoDB Client Options>'),

  // Specify the network port for the errsole dashboard. The default port is 8001 if not specified.
  port: 8001,

  // Define the base path for accessing the errsole dashboard. Default is the root path ('/').
  path: '/',

  // Configure the types of logs to capture. By default, 'info' and 'error' logs are captured.
  captureLogs: ['info', 'error'],

  // Control whether log output is also shown in the console. The default setting is true, allowing console output.
  enableConsoleOutput: true
});
// End of Errsole code snippet
```

#### Example

```javascript
/**
 * Insert this Errsole code snippet as the first line of your app's main file
 */
const errsole = require('errsole');
const ErrsoleMongoDB = require('errsole-mongodb');

errsole.initialize({
  storage: new ErrsoleMongoDB('mongodb://localhost:27017/', 'logs')
});
// End of Errsole code snippet

/**
 * Your app code starts here
 */
const express = require('express');
const app = express();

app.get('/', function (req, res) {
  res.send('Hello World');
});

app.listen(3000);
```