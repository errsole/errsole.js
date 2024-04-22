# Errsole with MariaDB

### Install

Install the errsole, errsole-sequelize and mariadb modules using the npm install command:

```bash
npm install errsole errsole-sequelize mariadb
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
    dialect: 'mariadb', // This specifies that you are using MariaDB
    host: 'mariadb-host', // Replace with your actual MariaDB host
    username: 'database-username', // Replace with your actual MariaDB username
    password: 'database-password', // Replace with your actual MariaDB password
    database: 'database-name' // Replace with the name of your MariaDB database
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
    dialect: 'mariadb',
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
| storage             	| ErrsoleSequelize 	| Required.<br>Setup MariaDB as the storage backend with connection details.                                                                                                                                                                                                                                 	|
| collectLogs         	| Array of Strings 	| Optional. The default value is ['error', 'info'].<br>By default, Errsole collects both error and info logs. If you wish to limit Errsole to collecting only error logs, you can set this option to ['error']. If you prefer Errsole not to collect any logs, simply set this option to an empty array, []. 	|
| enableConsoleOutput 	| Boolean          	| Optional. The default value is true.<br>Control whether log output is also shown in the console.                                                                                                                                                                                                           	|
| enableDashboard     	| Boolean          	| Optional. The default value is true.<br>Enable or disable the web dashboard feature.                                                                                                                                                                                                                       	|
| port                	| Number           	| Optional. The default value is 8001.<br>Specify the network port for the web dashboard.                                                                                                                                                                                                                    	|
| path                	| String           	| Optional. The default value is '/'.<br>Define the base path for accessing the web dashboard.                                                                                                                                                                                                               	|

### Web Dashboard

After the setup, access the Errsole Web Dashboard at [http://localhost:8001/](http://localhost:8001/). If you have configured Errsole with a different port and path during initialization, remember to replace "8001" in the URL with your chosen port number and add your custom path to the end of the URL.

### Main Documentation

[Main Documentation](/README.md)
