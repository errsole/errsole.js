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
import { NestFactory } from '@nestjs/core';
import * as bodyParser from 'body-parser';
import * as errsole from 'errsole';
import * as ErrsoleSequelize from 'errsole-sequelize';
import { AppModule } from './app.module';

// Initialize Errsole with a custom path
errsole.initialize({
  storage: new ErrsoleSequelize({
    dialect: 'sqlite',
    storage: '/tmp/logs.sqlite'
  }),
  path: '/logs/dashboard' // Custom path
});

async function bootstrap () {
  const app = await NestFactory.create(AppModule);

  // Use Errsole Proxy Middleware
  app.use(bodyParser.json());
  app.use('/errsole', (req, res, next) => {
    errsole.nestExpressProxyMiddleware('/errsole', req, res, next);
  });

  await app.listen(3000);
}
bootstrap();
