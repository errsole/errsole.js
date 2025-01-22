## Errsole Proxy Middleware

To integrate the Errsole Web Dashboard as a route within your main app, use the Errsole Proxy Middleware. This middleware maps a specified route in your app to the Errsole Web Dashboard. Here is a step-by-step guide:

* **Include Errsole Proxy Middleware:** Include the Errsole Proxy Middleware in your app. Make sure to specify a path where the Errsole Web Dashboard will be accessible. This path is mandatory.
* **Order of Middleware:** Ensure the Errsole Proxy Middleware is the first middleware in your app. Any other middleware should be placed after it.

Once you have done that, you will be able to access the Errsole Web Dashboard using the same domain as your app. For example:

* **Local Setup:** If your local app runs on port 3000, you can access the Errsole Web Dashboard at `http://localhost:3000/errsole`.
* **Remote Deployment:** If your remote app is hosted at `https://api.example.com`, you can access the Errsole Web Dashboard at `https://api.example.com/errsole`.

### Examples

* [Express](#express)
* [Fastify](#fastify)
* [Hapi](#hapi)
* [Koa](#koa)
* [Nest](#nest)

### Express

```javascript
const express = require('express');
const errsole = require('errsole');
const ErrsoleSQLite = require('errsole-sqlite');

// Insert the Errsole code snippet at the beginning of your app's main file
errsole.initialize({
  storage: new ErrsoleSQLite('/tmp/logs.sqlite')
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
import ErrsoleSQLite from 'errsole-sqlite';

// Insert the Errsole code snippet at the beginning of your app's main file
errsole.initialize({
  storage: new ErrsoleSQLite('/tmp/logs.sqlite')
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

### Hapi

```javascript
'use strict';

const Hapi = require('@hapi/hapi');
const errsole = require('errsole');
const ErrsoleSQLite = require('errsole-sqlite');

// Insert the Errsole code snippet at the beginning of your app's main file
errsole.initialize({
  storage: new ErrsoleSQLite('/tmp/logs.sqlite')
});

const init = async () => {
  const server = Hapi.server({
    port: 3000,
    host: 'localhost'
  });

  // Register the Errsole Proxy Middleware at the desired path (e.g., /errsole)
  // Make sure this is the first plugin to be registered
  await server.register({
    plugin: errsole.hapiProxyMiddleware('/errsole')
  });

  // Register other plugin below the Errsole Proxy Middleware

  await server.start();
  console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {
  console.log(err);
  process.exit(1);
});

init();
```

#### Note

If you have initialized Errsole with a custom path, you need to append this custom path to the middleware path: [Code Example](/examples/proxy-middleware/hapi-custom-path.js)

### Koa

```javascript
const errsole = require('errsole');
const ErrsoleSQLite = require('errsole-sqlite');
const Koa = require('koa');

// Insert the Errsole code snippet at the beginning of your app's main file
errsole.initialize({
  storage: new ErrsoleSQLite('/tmp/logs.sqlite')
});

const app = new Koa();

// Register the Errsole Proxy Middleware at the desired path (e.g., /errsole)
// Make sure this is the first middleware used
app.use(errsole.koaProxyMiddleware('/errsole'));

// Add other middlewares below the Errsole Proxy Middleware
app.use(async (ctx, next) => {
  await next();
  const rt = ctx.response.get('X-Response-Time');
  console.log(`${ctx.method} ${ctx.url} - ${rt}`);
});
app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  ctx.set('X-Response-Time', `${ms}ms`);
});
app.use(async ctx => {
  ctx.body = 'Hello World';
});

app.listen(3000);
```

#### Note

If you have initialized Errsole with a custom path, you need to append this custom path to the middleware path: [Code Example](/examples/proxy-middleware/koa-custom-path.js)

### Nest

```javascript
import { NestFactory } from '@nestjs/core';
import * as bodyParser from 'body-parser';
import errsole from 'errsole';
import ErrsoleSQLite from 'errsole-sqlite';
import { AppModule } from './app.module';

// Insert the Errsole code snippet at the beginning of your app's main file
errsole.initialize({
  storage: new ErrsoleSQLite('/tmp/logs.sqlite')
});

async function bootstrap () {
  const app = await NestFactory.create(AppModule);

  // Register the Errsole Proxy Middleware at the desired path (e.g., /errsole)
  // Make sure this is the first middleware used
  // Use body-parser middleware if NestJS is using Express
  app.use(bodyParser.json());
  app.use('/errsole', (req, res, next) => {
    errsole.nestExpressProxyMiddleware('/errsole', req, res, next);
  });

  // For Fastify, use the following middleware
  // app.use('/errsole', (req, res, next) => {
  //   errsole.nestFastifyProxyMiddleware('/errsole', req, res);
  // });

  // Add other middlewares below the Errsole Proxy Middleware

  await app.listen(3000);
}
bootstrap();
```

#### Note

If you have initialized Errsole with a custom path, you need to append this custom path to the middleware path: [Code Example](/examples/proxy-middleware/nest-custom-path.ts)

## Main Documentation

[Main Documentation](/README.md)
