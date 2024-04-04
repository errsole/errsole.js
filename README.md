<p align="center">
    <img src="https://www.errsole.com/assets/npm/errsole-logo-20230513.png" width="150"/>
    <h3 align="center">Node.js Logger with Built-in Dashboard</h3>
    <p align="center">View, Filter, and Analyze the logs in real time</p>
</p>

---

# A Logger with Built-in dashboard (Open Source)

Errsole is an open-source logger with built-in dashboard. It goes beyond traditional logging by capturing log messages and storing them in a specified database. What sets Errsole apart is its interactive web dashboard, which allows users to effortlessly view, filter, and analyze their logs in real time.

## Features

- **Effortless Integration**: Get Errsole up and running with minimal setup, seamlessly integrating into your Node.js projects.
- **Automated Log Capture**: Automatically captures both informational and error logs, ensuring that you never miss vital application insights.
- **Web Dashboard**: Utilize the intuitive web interface for a comprehensive log analysis experience, enabling efficient log viewing, filtering, and real-time insights.

## Documentation
- [Errsole with MongoDB](#errsole-with-mongodb)
- [Errsole With MySQL](#errsole-with-mysql)

---

## Errsole with MongoDB

1. **Installation**: Using npm:

    ```bash
    npm install errsole errsole-mongodb
    ```

2. **Configuration**: Initialize Errsole in your application:

    ```javascript
    const errsole = require('errsole');
    const ErrsoleMongoDB = require('errsole-mongodb');
    // or using ESM
    // import errsole from 'errsole';
    // import ErrsoleMongoDB from 'errsole-mongodb';

    errsole.initialize({
      storage: new ErrsoleMongoDB('your-mongodb-url', 'your-database-name', 'options'),
      port: 8001, // Optional: Specify the dashboard port, default is 8001
      path: '/',  // Optional: Specify the dashboard base path, default is '/'
      captureLogs: ['info', 'error'], // Optional: Specify which logs to capture, default is ['info', 'error']
      enableConsoleOutput: true // Optional: Set to false to prevent logs from printing in the terminal, default is true
    });
    ```

    - Replace `'your-mongodb-url'` with your actual MongoDB connection URL.
    - Replace `'your-database-name'` with the name of the database where logs should be stored.
    - Replace `'options'` with any MongoDB-specific options you need.

### Example Usage

Integrate Errsole into a simple Express app to see it in action:

```javascript
const errsole = require('errsole');
const ErrsoleMongoDB = require('errsole-mongodb');

errsole.initialize({
  storage: new ErrsoleMongoDB('your-mongodb-url', 'your-database-name')
});
// Errsole setup (as shown above)

const express = require('express');
const app = express();


app.get('/', (req, res) => {
  res.send('Hello World');
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));

```

## Accessing the Dashboard
Once Errsole is integrated and your application is running, access the Errsole dashboard through your web browser:

```bash
http://localhost:8001/
```
If you specified a custom port or path during initialization, adjust the URL accordingly.

---

## Errsole with MySQL

1. **Installation**: Using npm:

    ```bash
    npm install errsole errsole-sequelize mysql2
    ```

2. **Configuration**: Initialize Errsole in your application:

    ```javascript
    const errsole = require('errsole');
    const ErrsoleSequelize = require('errsole-sequelize');
    // or using ESM
    // import errsole from 'errsole';
    // import ErrsoleSequelize from 'errsole-sequelize';

    errsole.initialize({
      storage: new ErrsoleSequelize({
        host: 'mysql-host', // Replace with your actual MySQL host
        username: 'database-username', // Replace with your actual MySQL username
        password: 'database-password', // Replace with your actual MySQL password
        database: 'database-name', // Replace with the name of your MySQL database
        dialect: 'mysql' // This specifies that you are using MySQL
      }),
      port: 8001, // Optional: Specify the dashboard port, default is 8001
      path: '/',  // Optional: Specify the dashboard base path, default is '/'
      captureLogs: ['info', 'error'], // Optional: Specify which logs to capture, default is ['info', 'error']
      enableConsoleOutput: true // Optional: Set to false to prevent logs from printing in the terminal, default is true
    });
    ```

    - host: This should be set to the host address of your MySQL server.
    - username: This should be set to the username for your MySQL database.
    - password: This should be set to the password for your MySQL database.
    - database: This should be set to the name of the MySQL database where logs should be stored.
    - dialect: This is set to 'mysql' to indicate that MySQL is being used.

### Example Usage

Integrate Errsole into a simple Express app to see it in action:

```javascript
const errsole = require('errsole');
const ErrsoleSequelize = require('errsole-sequelize');

errsole.initialize({
  storage: new ErrsoleSequelize({
    host: 'localhost',
    username: 'root',
    password: 'password',
    database: 'dbname',
    dialect: 'mysql'
  })
});
// Errsole setup (as shown above)

const express = require('express');
const app = express();


app.get('/', (req, res) => {
  res.send('Hello World');
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));

```

## Accessing the Dashboard
Once Errsole is integrated and your application is running, access the Errsole dashboard through your web browser:

```bash
http://localhost:8001/
```
If you specified a custom port or path during initialization, adjust the URL accordingly.

---

## Contribution and Support
Contributing: Contributions are highly encouraged! If you have suggestions for improvements, feel free to fork the repository, make your changes, and submit a pull request.

Support: For support, questions, or feature requests, please open an issue on the GitHub repository. We're here to help make Errsole even better!

