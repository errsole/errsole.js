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

## Quick Start Guide

### Setting Up with MongoDB

1. **Installation**: Begin by installing Errsole and its MongoDB adapter through npm:

    ```bash
    npm install errsole errsole-mongodb
    ```

2. **Configuration**: Initialize Errsole in your application with MongoDB as the storage option:

    ```javascript
    const errsole = require('errsole');
    const ErrsoleMongoDB = require('errsole-mongodb');

    errsole.initialize({
      storage: new ErrsoleMongoDB('your-mongodb-url', 'your-database-name'),
      port: 8001, // Optional: Specify the dashboard port (default is 8001)
      path: '/'  // Optional: Specify the dashboard base path (default is '/')
    });
    ```

    - Replace `'your-mongodb-url'` with your actual MongoDB connection URL.
    - Replace `'your-database-name'` with the name of the database where logs should be stored.

### Example Usage

Integrate Errsole into a simple Express app to see it in action:

```javascript
const express = require('express');
const app = express();

// Errsole setup (as shown above)

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

## Contribution and Support
Contributing: Contributions are highly encouraged! If you have suggestions for improvements, feel free to fork the repository, make your changes, and submit a pull request.

Support: For support, questions, or feature requests, please open an issue on the GitHub repository. We're here to help make Errsole even better!

