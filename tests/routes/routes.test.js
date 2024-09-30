const request = require('supertest');
const express = require('express');
const router = require('../../lib/main/server/routes/apiRoutes');
const userController = require('../../lib/main/server/controllers/userController');
const logController = require('../../lib/main/server/controllers/logController');
const appController = require('../../lib/main/server/controllers/appController');
const auth = require('../../lib/main/server/middleware/auth');
/* globals expect, jest, it,  describe,  beforeEach */
jest.mock('../../lib/main/server/controllers/userController');
jest.mock('../../lib/main/server/controllers/logController');
jest.mock('../../lib/main/server/controllers/appController');
jest.mock('../../lib/main/server/middleware/auth');

const app = express();
app.use(express.json());
app.use('/', router);

describe('Router', () => {
  let token;
  let adminToken;

  beforeEach(() => {
    jest.clearAllMocks();
    token = process.env.USER_TOKEN || 'Bearer testToken'; // Replaced with environment variable
    adminToken = process.env.ADMIN_TOKEN || 'Bearer adminTestToken'; // Replaced with environment variable

    auth.authenticateToken.mockImplementation((req, res, next) => {
      req.user = { id: 'userId' };
      next();
    });

    auth.authenticateTokenWithAdmin.mockImplementation((req, res, next) => {
      req.user = { id: 'adminId', role: 'admin' };
      next();
    });
  });

  describe('#User routes', () => {
    it('should serve index page', async () => {
      userController.serveIndexPage.mockImplementation((req, res) => res.send('Index Page'));

      const res = await request(app).get('/');
      expect(res.status).toBe(200);
      expect(res.text).toBe('Index Page');
      expect(userController.serveIndexPage).toHaveBeenCalled();
    });

    it('should create a user', async () => {
      userController.createUser.mockImplementation((req, res) => res.status(201).send('User Created'));

      const res = await request(app).post('/api/users/register').send({ username: 'test', password: 'test' });
      expect(res.status).toBe(201);
      expect(res.text).toBe('User Created');
      expect(userController.createUser).toHaveBeenCalled();
    });

    it('should login a user', async () => {
      userController.loginUser.mockImplementation((req, res) => res.send('User Logged In'));

      const res = await request(app).post('/api/users/login').send({ username: 'test', password: 'test' });
      expect(res.status).toBe(200);
      expect(res.text).toBe('User Logged In');
      expect(userController.loginUser).toHaveBeenCalled();
    });
  });

  describe('#Log routes', () => {
    it('should get logs', async () => {
      logController.getLogs.mockImplementation((req, res) => res.send('Logs'));

      const res = await request(app).get('/api/logs').set('Authorization', token);
      expect(res.status).toBe(200);
      expect(res.text).toBe('Logs');
      expect(logController.getLogs).toHaveBeenCalled();
    });
  });

  describe('#App routes', () => {
    it('should check updates', async () => {
      appController.checkUpdates.mockImplementation((req, res) => res.send('Updates'));

      const res = await request(app).get('/api/apps/check-updates').set('Authorization', token);
      expect(res.status).toBe(200);
      expect(res.text).toBe('Updates');
      expect(appController.checkUpdates).toHaveBeenCalled();
    });

    it('should get Slack details for admin', async () => {
      appController.getSlackDetails.mockImplementation((req, res) => res.send('Slack Details'));

      const res = await request(app).get('/api/apps/integrations/slack').set('Authorization', adminToken);
      expect(res.status).toBe(200);
      expect(res.text).toBe('Slack Details');
      expect(appController.getSlackDetails).toHaveBeenCalled();
    });
  });
});
