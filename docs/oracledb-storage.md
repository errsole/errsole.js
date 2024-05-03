# Errsole with OracleDB

### Install

Install the errsole, errsole-sequelize, and oracledb modules using the npm install command:

```bash
npm install errsole errsole-sequelize oracledb
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
    dialect: 'oracledb', // This specifies that you are using OracleDB
    host: 'oracledb-host', // Replace with your actual OracleDB host
    username: 'database-username', // Replace with your actual OracleDB username
    password: 'database-password', // Replace with your actual OracleDB password
    database: 'database-name' // Replace with the name of your OracleDB database
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
    dialect: 'oracledb',
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
| storage             	| ErrsoleSequelize 	| Required.<br>Setup OracleDB as the storage backend with connection details.                                                                                                                                                                                                                                	|
| collectLogs         	| Array of Strings 	| Optional. The default value is ['error', 'info'].<br>By default, Errsole collects both error and info logs. If you wish to limit Errsole to collecting only error logs, you can set this option to ['error']. If you prefer Errsole not to collect any logs, simply set this option to an empty array, []. 	|
| enableConsoleOutput 	| Boolean          	| Optional. The default value is true.<br>Control whether log output is also shown in the console.                                                                                                                                                                                                           	|
| exitOnException     	| Boolean          	| Optional. The default value is true.<br>By default, Errsole will exit the process after capturing an uncaught exception. If this is not the behavior you want, you can disable it by setting exitOnException to false.                                                                                     	|
| enableDashboard     	| Boolean          	| Optional. The default value is true.<br>Enable or disable the web dashboard feature.                                                                                                                                                                                                                       	|
| port                	| Number           	| Optional. The default value is 8001.<br>Specify the network port for the web dashboard.                                                                                                                                                                                                                    	|
| path                	| String           	| Optional. The default value is '/'.<br>Define the base path for accessing the web dashboard.                                                                                                                                                                                                               	|
| appName             	| String           	| Optional. The default value is the name from package.json.<br>Specify the name of the app.                                                                                                                                                                                                                 	|
| environmentName     	| String           	| Optional. The default value is process.env.NODE_ENV.<br>Specify the deployment environment.                                                                                                                                                                                                                	|
| serverName          	| String           	| Optional. The default value is the hostname of the machine.<br>Specify the name of the server.                                                                                                                                                                                                             	|

### Web Dashboard

After the setup, access the Errsole Web Dashboard at [http://localhost:8001/](http://localhost:8001/). If you have configured Errsole with a different port and path during initialization, remember to replace "8001" in the URL with your chosen port number and add your custom path to the end of the URL.

### Proxy Middleware Configuration

If you are having trouble reaching port 8001 due to firewall restrictions or if you prefer hosting the Errsole Web Dashboard on your main domain/port, you can configure Errsole Middleware in your app.

Just add this code to your app:

```javascript
app.use('/errsole', errsole.proxyMiddleware());
```

Once you have done that, you will be able to access the Errsole Web Dashboard using the same domain as your app. For example:

* If your local app runs on port 3000, you can access the Errsole Web Dashboard at http://localhost:3000/errsole.
* If your remote app is at https://api.example.com, you can access the Errsole Web Dashboard at https://api.example.com/errsole.

**Note:** At present, Errsole Middleware supports only one level path. Here's a comparison to clarify:

```javascript
// Works fine
app.use('/logsdashboard', errsole.proxyMiddleware());

// Does not work
app.use('/logs/dashboard', errsole.proxyMiddleware());
```

### Main Documentation

[Main Documentation](/README.md)
