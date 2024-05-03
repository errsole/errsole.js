# Errsole with MongoDB

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
  storage: new ErrsoleMongoDB('<MongoDB Connection URL>', '<Optional: Database Name>', '<Optional: MongoDB Client Options>')
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

#### Advanced Configuration

| **Option**          	| **Type**         	| **Description**                                                                                                                                                                                                                                                                                            	|
|---------------------	|------------------	|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------	|
| storage             	| ErrsoleMongoDB   	| Required.<br>Setup MongoDB as the storage backend with connection details.                                                                                                                                                                                                                                 	|
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

Should you encounter issues accessing port 8001, possibly due to firewall constraints, or if you prefer to host the Errsole Web Dashboard on your primary domain/port, configure the Errsole Proxy Middleware in your app. Follow these steps:

1. Specify the custom path for the Errsole Web Dashboard during the initialization of Errsole.
2. Integrate the Errsole Proxy Middleware into your app.

**Example:**

```javascript
const errsole = require('errsole');
const ErrsoleMongoDB = require('errsole-mongodb');

// Initialize Errsole with storage and custom path
errsole.initialize({
  storage: new ErrsoleMongoDB('mongodb://localhost:27017/', 'logs'),
  path: '/errsole'
});

const express = require('express');
const app = express();

// Use Errsole proxy middleware
app.use(errsole.proxyMiddleware());

app.get('/', function (req, res) {
  res.send('Hello World');
});

app.listen(3000);
```

Once you have done that, you will be able to access the Errsole Web Dashboard using the same domain as your app. For example:

* If your local app runs on port 3000, you can access the Errsole Web Dashboard at http://localhost:3000/errsole.
* If your remote app is at https://api.example.com, you can access the Errsole Web Dashboard at https://api.example.com/errsole.

### Main Documentation

[Main Documentation](/README.md)
