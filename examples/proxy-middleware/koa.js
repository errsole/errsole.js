const errsole = require('errsole');
const ErrsoleSequelize = require('errsole-sequelize');
const Koa = require('koa');

// Insert the Errsole code snippet at the beginning of your app's main file
errsole.initialize({
  storage: new ErrsoleSequelize({
    dialect: 'sqlite',
    storage: '/tmp/logs.sqlite'
  })
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
