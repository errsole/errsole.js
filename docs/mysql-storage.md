# Errsole with MySQL

### 1. Install the modules

Install the `errsole` and `errsole-mysql` modules using the npm install command:

```bash
npm install errsole errsole-mysql
```

### 2. Configure your logger

Create a `logger.js` file to configure Errsole with MySQL for your app.

#### CommonJS:

```javascript
const errsole = require('errsole');
const ErrsoleMySQL = require('errsole-mysql');

errsole.initialize({
  storage: new ErrsoleMySQL({
    host: 'mysql-host', // Replace with your actual MySQL host
    user: 'database-user', // Replace with your actual MySQL user
    password: 'database-password', // Replace with your actual MySQL password
    database: 'database-name', // Replace with the name of your MySQL database
    tablePrefix: 'app-name' // Replace with your actual app name
  }),
  appName: 'app-name' // Replace with your actual app name
});

module.exports = errsole;
```

#### ESM and TypeScript:

```javascript
import errsole from 'errsole';
import ErrsoleMySQL from 'errsole-mysql';

errsole.initialize({
  storage: new ErrsoleMySQL({
    host: 'mysql-host', // Replace with your actual MySQL host
    user: 'database-user', // Replace with your actual MySQL user
    password: 'database-password', // Replace with your actual MySQL password
    database: 'database-name', // Replace with the name of your MySQL database
    tablePrefix: 'app-name' // Replace with your actual app name
  }),
  appName: 'app-name' // Replace with your actual app name
});

export default errsole;
```

### 3. Include the logger in your app code

Include the logger in your app code to start logging. Here is an example using Express:

```javascript
import express from 'express';
import errsole from './logger.js';

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
* Local Development: Open your web browser and go to `http://localhost:8001/`
* Remote Deployment: Replace `YourServerIP` or `YourDomain` with your server details:
```
http://YourServerIP:8001/
http://YourDomain:8001/
```

### 4. Configure NGINX

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

After updating the configuration, reload NGINX:

```
sudo nginx -s reload
```

You can now access the Errsole Web Dashboard through your domain:

* For HTTP: `http://YourDomain/helloworld/logs/`
* For HTTPS: `https://YourDomain/helloworld/logs/`

**Note:** Replace `/helloworld/logs` with your desired log path.

## Advanced Configuration

| **Option**          	| **Type**                                                                                                                                                                           	| **Description**                                                                                                                                                                                                               	|
|---------------------	|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------	|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------	|
| storage             	| [ErrsoleSQLite](/docs/sqlite-storage.md)<br>[ErrsoleMySQL](/docs/mysql-storage.md)<br>[ErrsolePostgres](/docs/postgresql-storage.md)<br>[ErrsoleMongoDB](/docs/mongodb-storage.md) 	| **Required.** Specify the storage backend along with connection details.                                                                                                                                                      	|
| collectLogs         	| Array of Strings                                                                                                                                                                   	| **Optional.** Default: `['error', 'info']`. By default, Errsole collects both error and info logs. To collect only error logs, set this to `['error']`. To disable log collection entirely, set this to an empty array, `[]`. 	|
| enableConsoleOutput 	| Boolean                                                                                                                                                                            	| **Optional.** Control whether log output is shown in the console.                                                                                                                                                             	|
| exitOnException     	| Boolean                                                                                                                                                                            	| **Optional.** Default: `true`. By default, Errsole exits the process after capturing an uncaught exception. To disable this behavior, set exitOnException to `false`.                                                         	|
| enableDashboard     	| Boolean                                                                                                                                                                            	| **Optional.** Default: `true`. Enable or disable the web dashboard feature.                                                                                                                                                   	|
| port                	| Number                                                                                                                                                                             	| **Optional.** Default: `8001`. Specify the network port for the web dashboard.                                                                                                                                                	|
| path                	| String                                                                                                                                                                             	| **Optional.** Default: `/`. Define the base path for accessing the web dashboard.                                                                                                                                             	|
| appName             	| String                                                                                                                                                                             	| **Optional.** Specify the name of the app.                                                                                                                                                                                    	|
| environmentName     	| String                                                                                                                                                                             	| **Optional.** Default: `process.env.NODE_ENV`. Specify the deployment environment.                                                                                                                                            	|
| serverName          	| String                                                                                                                                                                             	| **Optional.** Default: the hostname of the machine. Specify the name of the server.                                                                                                                                           	|

## Advanced Logging Functions

Errsole automatically collects all logs from the Node.js console. Additionally, it provides advanced logging functions that support multiple log levels. [Read More](/docs/advanced-logging-functions.md)

```javascript
errsole.log('Logging a message');
errsole.alert('Alert! Something critical happened');
errsole.error(new Error('An error occurred'));
errsole.warn('This is a warning message');
errsole.debug('Debugging information');
errsole.meta({ reqBody: req.body, queryResults: results }).error(err);
```

## Errsole Proxy Middleware (Optional)

To integrate the Errsole Web Dashboard as a route within your main app, use the Errsole Proxy Middleware. This middleware maps a specified route in your app to the Errsole Web Dashboard. [Read More](/docs/proxy-middleware.md)

## Main Documentation

[Main Documentation](/README.md)
