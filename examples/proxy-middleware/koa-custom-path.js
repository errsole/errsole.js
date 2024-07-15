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
const errsole = require('errsole');
const ErrsoleSQLite = require('errsole-sqlite');
const Koa = require('koa');

// Initialize Errsole with a custom path
errsole.initialize({
  storage: new ErrsoleSQLite('/tmp/logs.sqlite'),
  path: '/logs/dashboard' // Custom path
});

const app = new Koa();

// Use Errsole Proxy Middleware
app.use(errsole.koaProxyMiddleware('/errsole'));

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
