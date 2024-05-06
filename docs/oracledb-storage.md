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

### Web Dashboard Access

After completing the setup, you can access the Errsole Web Dashboard through the following methods:

1. **Local Environment:** Open your web browser and visit `http://localhost:8001/`.
2. **Remote Server:** If you have deployed Errsole on a remote server, use the server's IP address or domain name followed by the port number (e.g., YourServerIP:8001 or YourDomain:8001).

#### Note

If you initialized Errsole with a different port or specified a custom path, adjust the URL as follows:

1. Replace 8001 with your chosen port number.
2. Append your custom path to the end of the URL.

`http(s)://YourServerIP:CustomPort/YourCustomPath`

### Proxy Middleware Configuration

If you encounter issues accessing port 8001 due to firewall restrictions, or if you prefer to host the Errsole Web Dashboard on your primary domain/port, you can configure the Errsole Proxy Middleware in your app. Here is a step-by-step guide: [Proxy Middleware Configuration](/docs/proxy-middleware-configuration.md)

### Main Documentation

[Main Documentation](/README.md)
