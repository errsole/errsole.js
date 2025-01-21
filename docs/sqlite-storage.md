# Errsole with SQLite

SQLite stores databases as files. So, your app logs will be stored as a file on your server.

### 1. Install the modules

Install the `errsole` and `errsole-sqlite` modules using the npm install command:

```bash
npm install errsole errsole-sqlite
```

### 2. Configure your logger

Create a `logger.js` file to configure Errsole for your app:

```javascript
// CommonJS
const errsole = require('errsole');
const ErrsoleSQLite = require('errsole-sqlite');

errsole.initialize({
  storage: new ErrsoleSQLite('path/to/database.sqlite')
});

module.exports = errsole;
```

```javascript
// ESM and TypeScript
import errsole from 'errsole';
import ErrsoleSQLite from 'errsole-sqlite';

errsole.initialize({
  storage: new ErrsoleSQLite('path/to/database.sqlite')
});

export default errsole;
```

#### Example
```javascript
import errsole from 'errsole';
import ErrsoleSQLite from 'errsole-sqlite';
import os from 'os';
import path from 'path';

const logsFile = path.join(os.tmpdir(), 'helloworld.log.sqlite');

errsole.initialize({
  storage: new ErrsoleSQLite(logsFile)
});

export default errsole;
```

### 3. Include the logger in your app code

To start logging, include the logger in your app code. Here is an example using Express:

```javascript
import express from 'express';
import errsole from './logger';

const app = express();

app.get('/', (req, res) => {
  res.send('Hello World!');
});

const port = 3000;
app.listen(port, () => {
  errsole.log(`Hello World app is listening on port ${port}`);
});
```

After completing the setup, start your app and access the Errsole Web Dashboard to view and manage your logs:

**Local Development:** Open your web browser and go to http://localhost:8001/

**Remote Deployment:** Use the server's IP address or domain followed by the port number. For example:

```
http://YourServerIP:8001/
http://YourDomain:8001/
```

### 4. NGINX Configuration

If your app is behind an NGINX reverse proxy, you can configure access to the Errsole Web Dashboard by adding the following lines to your NGINX configuration file:

```
location = /helloworld/logs {
  return 301 /helloworld/logs/;
}
location /helloworld/logs/ {
  proxy_pass http://localhost:8001/;
  proxy_http_version 1.1;
  proxy_set_header Upgrade $http_upgrade;
  proxy_set_header Connection "upgrade";
}
```

Once configured, reload NGINX to apply the changes:

```
sudo nginx -s reload
```

You can now access the dashboard through your domain:

* For HTTP: http://YourDomain/helloworld/logs/
* For HTTPS: https://YourDomain/helloworld/logs/

**Note:** Replace `/helloworld/logs` with your desired log path.

### Advanced Configuration

[Advanced Configuration](/docs/advanced-configuration.md)

### Web Dashboard Access

[Web Dashboard Access](/docs/web-dashboard-access.md)

### Main Documentation

[Main Documentation](/README.md)
