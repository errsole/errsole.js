<p align="center">
  <img src="https://github.com/errsole/errsole.js/assets/3775513/e7499016-cb28-488d-a47d-f1ba24804d2b" width="256"/>

  <h3 align="center">Node.js Logger with a Built-in Dashboard</h3>
</p>

Errsole is an open-source logger for Node.js. It has a built-in web dashboard to view, filter, and search your app logs.

https://github.com/errsole/errsole.js/assets/3775513/b8d7025d-9b82-464a-954a-8e27be51fd3a

## Features

* **Easy Setup:** Just insert the Errsole code snippet at the beginning of your app's main file. That's it!

* **Automated Log Collection:** Errsole automatically collects all your app logs directly from the Node.js console.

* **Customized Logging:** Errsole's custom logger provides multiple log levels, thereby enabling greater precision in logging. Additionally, you can include metadata with your logs and receive alerts for specific log events according to your preferences. [Read More](#custom-logging-functions)

* **Centralized Logging:** Errsole consolidates all your app logs from multiple servers into one centralized database. You can choose your preferred database system.

* **Interactive Web Dashboard:** Easily view, filter, and search your app logs using the Errsole Web Dashboard.

* **Secure Access Control:** Errsole comes with built-in authentication, ensuring that only you and your authorized development team can access the logs.

* **Error Notifications:** Errsole delivers notifications for app crashes and custom alerts directly to your Email or Slack.

* **Data Retention:** You can specify the number of days you wish to keep your app logs.

## Setup

* [Errsole with SQLite (Quick Setup)](docs/sqlite-storage.md)
* [Errsole with MongoDB](docs/mongodb-storage.md)
* [Errsole with MySQL](docs/mysql-storage.md)
* [Errsole with PostgreSQL](docs/postgresql-storage.md)
* [Errsole with MariaDB](docs/mariadb-storage.md)
* [Errsole with OracleDB](docs/oracledb-storage.md)

## Web Dashboard Access

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

## Custom Logging Functions

### log / info

The log function is used to log messages or information. It can accept one or more arguments, which can be strings, numbers, JavaScript objects, or Error objects.

#### Example

```javascript
errsole.log('Logging a message');
errsole.log('Multiple', 'arguments', 'are supported');
errsole.log('Logging with a variable:', var1);
errsole.log(new Error('An error occurred'));
errsole.log('Logging with an error object:', errorObject);
```

### alert

The alert function logs a message and sends a notification to configured channels, such as Email or Slack. It accepts the same types of arguments as the log function.

#### Example

```javascript
errsole.alert('Alert! Something critical happened');
```

### error

The error function is specifically designed to log errors. It accepts the same types of arguments as the log function.

#### Example

```javascript
errsole.error(new Error('An error occurred'));
```

### warn

The warn function is used to log warning messages. It accepts the same types of arguments as the log function.

#### Example

```javascript
errsole.warn('This is a warning message');
```

### debug

The debug function logs debug information, typically used for troubleshooting during development. It accepts the same types of arguments as the log function.

#### Example

```javascript
errsole.debug('Debugging information');
```

## Contribution and Support

**Contribution:** We welcome contributions! If you have ideas for improvements, feel free to fork the repository, make your changes, and submit a pull request.

**Support:** Have questions, facing issues, or want to request a feature? [Open an issue](https://github.com/errsole/errsole.js/issues/new) on the GitHub repository.

## License

[MIT](LICENSE)
