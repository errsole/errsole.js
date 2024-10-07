# Errsole with SQLite

SQLite stores databases as files. So, if you use SQLite to store logs, those logs will be stored as a file on the storage system.

### Install

Install the `errsole` and `errsole-sqlite` modules using the npm install command:

```bash
npm install errsole errsole-sqlite
```

### Configure

```javascript
// CommonJS
const errsole = require('errsole');
const ErrsoleSQLite = require('errsole-sqlite');
```

```javascript
// ESM and TypeScript
import errsole from 'errsole';
import ErrsoleSQLite from 'errsole-sqlite';
```

```javascript
// Insert the Errsole code snippet at the beginning of your app's main file
errsole.initialize({
  storage: new ErrsoleSQLite('path/to/database.sqlite')
});
```

#### Example

```javascript
const express = require('express');
const errsole = require('errsole');
const ErrsoleSQLite = require('errsole-sqlite');

// Insert the Errsole code snippet at the beginning of your app's main file
errsole.initialize({
  storage: new ErrsoleSQLite('/tmp/logs.sqlite')
});

const app = express();

app.get('/', function (req, res) {
  res.send('Hello World');
});

app.listen(3000);
```

#### Advanced Configuration

| **Option**          	| **Type**         	| **Description**                                                                                                                                                                                                                                                                                            	|
|---------------------	|------------------	|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------	|
| storage             	| ErrsoleSQLite 	  | Required.<br>Setup SQLite as the storage backend with connection details.                                                                                                                                                                                                                                  	|
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

[Web Dashboard Access](/docs/web-dashboard-access.md)

### Main Documentation

[Main Documentation](/README.md)
