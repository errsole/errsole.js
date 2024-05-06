# Proxy Middleware Configuration

If you encounter issues accessing port 8001 due to firewall restrictions, or if you prefer to host the Errsole Web Dashboard on your primary domain/port, you can configure the Errsole Proxy Middleware in your app. Here is a step-by-step guide:

### Step-by-Step Instructions

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

### Key Points to Remember

* **Path is Required:** Provide a path for the middleware where the Errsole Web Dashboard can be accessed.
* **Order of Middleware Matters:** Always place the Errsole Proxy Middleware first in your middleware stack.

Once you have done that, you will be able to access the Errsole Web Dashboard using the same domain as your app. For example:

* If your local app runs on port 3000, you can access the Errsole Web Dashboard at http://localhost:3000/errsole.
* If your remote app is at https://api.example.com, you can access the Errsole Web Dashboard at https://api.example.com/errsole.

### Note

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