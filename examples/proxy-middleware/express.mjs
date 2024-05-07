import errsole from 'errsole';
import ErrsoleSequelize from 'errsole-sequelize';
import express from 'express';

// Initialize Errsole
errsole.initialize({
  storage: new ErrsoleSequelize({
    dialect: 'sqlite',
    storage: '/tmp/logs.sqlite'
  })
});

const app = express();

// Register Errsole Proxy Middleware at the desired path (e.g., /errsole)
// Make sure this is the first middleware used
app.use('/errsole', errsole.proxyMiddleware());

// Add other middlewares below the Errsole Proxy Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
