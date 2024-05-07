// In this example, the Errsole Web Dashboard will be accessible at http://localhost:3000/errsole/logs/dashboard
import Fastify from 'fastify';
import expressPlugin from '@fastify/express';
import errsole from 'errsole';
import ErrsoleSequelize from 'errsole-sequelize';

// Initialize Errsole with a custom path
errsole.initialize({
  storage: new ErrsoleSequelize({
    dialect: 'sqlite',
    storage: '/tmp/logs.sqlite'
  }),
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
