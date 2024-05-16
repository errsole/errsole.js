import { NestFactory } from '@nestjs/core';
import * as bodyParser from 'body-parser';
import errsole from 'errsole';
import ErrsoleSequelize from 'errsole-sequelize';
import { AppModule } from './app.module';

// Insert the Errsole code snippet at the beginning of your app's main file
errsole.initialize({
  storage: new ErrsoleSequelize({
    dialect: 'sqlite',
    storage: '/tmp/logs.sqlite'
  })
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
