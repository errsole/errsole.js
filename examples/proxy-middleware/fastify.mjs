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
