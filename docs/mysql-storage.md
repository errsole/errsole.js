# Errsole with MySQL

### Install

Install the errsole, errsole-sequelize, and mysql2 modules using the npm install command:

```bash
npm install errsole errsole-sequelize mysql2
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
    dialect: 'mysql', // This specifies that you are using MySQL
    host: 'mysql-host', // Replace with your actual MySQL host
    username: 'database-username', // Replace with your actual MySQL username
    password: 'database-password', // Replace with your actual MySQL password
    database: 'database-name' // Replace with the name of your MySQL database
  })
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
    dialect: 'mysql',
    host: 'localhost',
    username: 'root',
    password: 'password',
    database: 'dbname'
  })
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

#### Advanced Configuration

| **Option**          	| **Type**         	| **Description**                                                                                                                                                                                                                                                                                            	|
|---------------------	|------------------	|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------	|
| storage             	| ErrsoleSequelize 	| Required.<br>Setup MySQL as the storage backend with connection details.                                                                                                                                                                                                                                   	|
| collectLogs         	| Array of Strings 	| Optional. The default value is ['error', 'info'].<br>By default, Errsole collects both error and info logs. If you wish to limit Errsole to collecting only error logs, you can set this option to ['error']. If you prefer Errsole not to collect any logs, simply set this option to an empty array, []. 	|
| enableConsoleOutput 	| Boolean          	| Optional. The default value is true.<br>Control whether log output is also shown in the console.                                                                                                                                                                                                           	|
| exitOnException     	| Boolean          	| Optional. The default value is true.<br>By default, Errsole will exit the process after capturing an uncaught exception. If this is not the behavior you want, you can disable it by setting exitOnException to false.                                                                                     	|
| enableDashboard     	| Boolean          	| Optional. The default value is true.<br>Enable or disable the web dashboard feature.                                                                                                                                                                                                                       	|
| port                	| Number           	| Optional. The default value is 8001.<br>Specify the network port for the web dashboard.                                                                                                                                                                                                                    	|
| path                	| String           	| Optional. The default value is '/'.<br>Define the base path for accessing the web dashboard.                                                                                                                                                                                                               	|
| appName             	| String           	| Optional. The default value is the name from package.json.<br>Specify the name of the app.                                                                                                                                                                                                                 	|
| environmentName     	| String           	| Optional. The default value is process.env.NODE_ENV.<br>Specify the deployment environment.                                                                                                                                                                                                                	|
| serverName          	| String           	| Optional. The default value is the hostname of the machine.<br>Specify the name of the server.                                                                                                                                                                                                             	|

### Web Dashboard Access

Once you have completed the setup, access the Errsole Web Dashboard at [http://localhost:8001/](http://localhost:8001/). If you have initialized Errsole using a different port or specified a custom path, make sure to adjust the URL accordingly. Replace 8001 with your chosen port and append your custom path at the end of the URL.

### Proxy Middleware Configuration

If you encounter issues accessing port 8001 due to firewall restrictions, or if you prefer to host the Errsole Web Dashboard on your primary domain/port, you can configure the Errsole Proxy Middleware in your app. Here is a step-by-step guide: [Proxy Middleware Configuration](/docs/proxy-middleware-configuration.md)

### Main Documentation

[Main Documentation](/README.md)
