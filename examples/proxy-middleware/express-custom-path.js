/*
 * ─────────────────────────────────────────────────────────────────────
 *                          ERRSOLE DASHBOARD SETUP
 * ─────────────────────────────────────────────────────────────────────
 * The Errsole Web Dashboard will be accessible at:
 * http://localhost:3000/errsole/logs/dashboard
 *
 * Here's how the complete path is constructed:
 * ─────────────────────────────────────────────────────────────────────
 * Middleware base path:           '/errsole'
 * Custom path in initialization:  '/logs/dashboard'
 * ─────────────────────────────────────────────────────────────────────
 */
const express = require('express');
const errsole = require('errsole');
const ErrsoleSQLite = require('errsole-sqlite');

// Initialize Errsole with a custom path
errsole.initialize({
  storage: new ErrsoleSQLite('/tmp/logs.sqlite'),
  path: '/logs/dashboard' // Custom path
});

const app = express();

// Use Errsole Proxy Middleware
app.use('/errsole', errsole.expressProxyMiddleware());

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
