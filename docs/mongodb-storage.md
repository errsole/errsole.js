# Errsole with MongoDB

### Install

Install the errsole and errsole-mongodb modules using the npm install command:

```bash
npm install errsole errsole-mongodb
```

### Configure

```javascript
// CommonJS
const errsole = require('errsole');
const ErrsoleMongoDB = require('errsole-mongodb');
```

```javascript
// ESM and TypeScript
import errsole from 'errsole';
import ErrsoleMongoDB from 'errsole-mongodb';
```

```javascript
// Insert the Errsole code snippet at the beginning of your app's main file
errsole.initialize({
  storage: new ErrsoleMongoDB('<MongoDB Connection URL>', '<Optional: Database Name>', '<Optional: MongoDB Client Options>')
});
```

#### Example

```javascript
const express = require('express');
const errsole = require('errsole');
const ErrsoleMongoDB = require('errsole-mongodb');

// Insert the Errsole code snippet at the beginning of your app's main file
errsole.initialize({
  storage: new ErrsoleMongoDB('mongodb://localhost:27017/', 'logs')
});

const app = express();

app.get('/', function (req, res) {
  res.send('Hello World');
});

app.listen(3000);
```

To store logs from multiple apps using Errsole, assign a unique `collectionPrefix` to each app. This ensures that the logs are stored separately for better organization and easy identification.

```javascript
const express = require('express');
const errsole = require('errsole');
const ErrsoleMongoDB = require('errsole-mongodb');

// Insert the Errsole code snippet at the beginning of your app's main file
errsole.initialize({
  storage: new ErrsoleMongoDB('mongodb://localhost:27017/', 'logs', { collectionPrefix: 'helloworld' })
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
