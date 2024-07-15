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
import errsole from 'errsole';
import ErrsoleSQLite from 'errsole-sqlite';
import { AppModule } from './app.module';

// Initialize Errsole with a custom path
errsole.initialize({
  storage: new ErrsoleSQLite('/tmp/logs.sqlite'),
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
