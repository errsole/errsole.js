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

If you encounter issues accessing port 8001 due to firewall restrictions, or if you prefer to host the Errsole Web Dashboard on your primary domain/port, you can configure the Errsole Proxy Middleware in your app. Here is a step-by-step guide:

#### Step-by-Step Instructions

* Include the Errsole Proxy Middleware in your app. Specify a path in the middleware where the Errsole Web Dashboard will be accessible.
* Ensure the Errsole Proxy Middleware is the first middleware in your app. Any other middleware should be placed after it.

#### Example

```javascript
const errsole = require('errsole');
const ErrsoleSequelize = require('errsole-sequelize');
const express = require('express');

// Initialize Errsole
errsole.initialize({
  storage: new ErrsoleSequelize({
    dialect: 'sqlite',
    storage: '/tmp/logs.sqlite'
  })
});

const app = express();

// Register Errsole Proxy Middleware at the desired path (e.g., /errsole)
// Make sure this is the first middleware used
app.use('/errsole', errsole.proxyMiddleware());

// Add other middlewares below the Errsole Proxy Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
```

#### Key Points to Remember

* **Path is Required:** Provide a path for the middleware where the Errsole Web Dashboard can be accessed.
* **Order of Middleware Matters:** Always place the Errsole Proxy Middleware first in your middleware stack.

Once you have done that, you will be able to access the Errsole Web Dashboard using the same domain as your app. For example:

* If your local app runs on port 3000, you can access the Errsole Web Dashboard at http://localhost:3000/errsole.
* If your remote app is at https://api.example.com, you can access the Errsole Web Dashboard at https://api.example.com/errsole.

#### Note

If you have initialized Errsole with a custom path, you need to append this custom path to the middleware path.

```javascript
const errsole = require('errsole');
const ErrsoleSequelize = require('errsole-sequelize');
const express = require('express');

// Initialize Errsole with a custom path
errsole.initialize({
  storage: new ErrsoleSequelize({
    dialect: 'sqlite',
    storage: '/tmp/logs.sqlite'
  }),
  path: '/logs/dashboard' // Custom path
});

const app = express();

// Use Errsole Proxy Middleware
app.use('/errsole', errsole.proxyMiddleware());

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
```

In the above example, the Errsole Web Dashboard will be accessible at http://localhost:3000/errsole/logs/dashboard.

### Main Documentation

[Main Documentation](/README.md)
