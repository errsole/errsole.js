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
import Fastify from 'fastify';
import expressPlugin from '@fastify/express';
import errsole from 'errsole';
import ErrsoleSQLite from 'errsole-sqlite';

// Initialize Errsole with a custom path
errsole.initialize({
  storage: new ErrsoleSQLite('/tmp/logs.sqlite'),
  path: '/logs/dashboard' // Custom path
});

const fastify = Fastify();
await fastify.register(expressPlugin);

// Use Errsole Proxy Middleware
fastify.use('/errsole', errsole.fastifyProxyMiddleware());

// Start the server
try {
  await fastify.listen({ port: 3000 });
} catch (err) {
  console.error(err);
  process.exit(1);
}
