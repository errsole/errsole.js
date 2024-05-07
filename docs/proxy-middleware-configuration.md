# Proxy Middleware Configuration

If you encounter issues accessing port 8001 due to firewall restrictions, or if you prefer to host the Errsole Web Dashboard on your primary domain/port, you can configure the Errsole Proxy Middleware in your app. Here is a step-by-step guide:

* **Include Errsole Proxy Middleware:** Include the Errsole Proxy Middleware in your app. Make sure to specify a path where the Errsole Web Dashboard will be accessible. This path is mandatory.
* **Order of Middleware:** Ensure the Errsole Proxy Middleware is the first middleware in your app. Any other middleware should be placed after it.

Once you have done that, you will be able to access the Errsole Web Dashboard using the same domain as your app. For example:

* **Local Setup:** If your local app runs on port 3000, you can access the Errsole Web Dashboard at `http://localhost:3000/errsole`.
* **Remote Deployment:** If your remote app is hosted at `https://api.example.com`, you can access the Errsole Web Dashboard at `https://api.example.com/errsole`.

## Examples

* [Express](#express)
* [Fastify](#fastify)

### Express

```javascript
const express = require('express');
const errsole = require('errsole');
const ErrsoleSequelize = require('errsole-sequelize');

// Insert the Errsole code snippet at the beginning of your app's main file
errsole.initialize({
  storage: new ErrsoleSequelize({
    dialect: 'sqlite',
    storage: '/tmp/logs.sqlite'
  })
});

const app = express();

// Register the Errsole Proxy Middleware at the desired path (e.g., /errsole)
// Make sure this is the first middleware used
app.use('/errsole', errsole.expressProxyMiddleware());

// Add other middlewares below the Errsole Proxy Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
```

#### Note

If you have initialized Errsole with a custom path, you need to append this custom path to the middleware path: [Code Example](/examples/proxy-middleware/express-custom-path.js)

### Fastify

```javascript
import Fastify from 'fastify';
import expressPlugin from '@fastify/express';
import errsole from 'errsole';
import ErrsoleSequelize from 'errsole-sequelize';

// Insert the Errsole code snippet at the beginning of your app's main file
errsole.initialize({
  storage: new ErrsoleSequelize({
    dialect: 'sqlite',
    storage: '/tmp/logs.sqlite'
  })
});

const fastify = Fastify();
await fastify.register(expressPlugin);

// Register the Errsole Proxy Middleware at the desired path (e.g., /errsole)
// Make sure this is the first middleware used
fastify.use('/errsole', errsole.fastifyProxyMiddleware());
// Add other middlewares below the Errsole Proxy Middleware

// Start the server
try {
  await fastify.listen({ port: 3000 });
} catch (err) {
  console.error(err);
  process.exit(1);
}
```

#### Note

If you have initialized Errsole with a custom path, you need to append this custom path to the middleware path: [Code Example](/examples/proxy-middleware/fastify-custom-path.mjs)

## Main Documentation

[Main Documentation](/README.md)
