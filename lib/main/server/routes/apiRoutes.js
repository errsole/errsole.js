const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const logController = require('../controllers/logController');
const appController = require('../controllers/appController');
const auth = require('../middleware/auth');

router.get('/', userController.serveIndexPage);

router.post('/api/users/register', userController.createUser);
router.post('/api/users/login', userController.loginUser);

router.get('/api/users', auth.authenticateToken, userController.getUserProfile);
router.patch('/api/users/update-profile', auth.authenticateToken, userController.updateUserProfile);
router.patch('/api/users/update-password', auth.authenticateToken, userController.updateUserPassword);
router.get('/api/users/all-users', auth.authenticateToken, userController.getAllUsers);
router.get('/api/users/total-users', userController.getTotalUsers);
router.post('/api/users', auth.authenticateToken, userController.addUser);
router.delete('/api/users/:userId', auth.authenticateToken, userController.removeUser);

router.get('/api/apps/check-updates', auth.authenticateToken, appController.checkUpdates);
router.get('/api/apps/integrations/slack', auth.authenticateTokenWithAdmin, appController.getSlackDetails);
router.post('/api/apps/integrations/slack', auth.authenticateTokenWithAdmin, appController.addSlackDetails);
router.patch('/api/apps/integrations/slack', auth.authenticateTokenWithAdmin, appController.updateSlackDetails);
router.delete('/api/apps/integrations/slack', auth.authenticateTokenWithAdmin, appController.deleteSlackDetails);
router.post('/api/apps/integrations/slack/test', auth.authenticateTokenWithAdmin, appController.testSlackNotification);

router.get('/api/apps/integrations/email', auth.authenticateTokenWithAdmin, appController.getEmailDetails);
router.post('/api/apps/integrations/email', auth.authenticateTokenWithAdmin, appController.addEmailDetails);
router.patch('/api/apps/integrations/email', auth.authenticateTokenWithAdmin, appController.updateEmailDetails);
router.delete('/api/apps/integrations/email', auth.authenticateTokenWithAdmin, appController.deleteEmailDetails);
router.post('/api/apps/integrations/email/test', auth.authenticateTokenWithAdmin, appController.testEmailNotification);
router.get('/api/apps/integrations/alert-url', auth.authenticateTokenWithAdmin, appController.getAlertUrlDetails);
router.post('/api/apps/integrations/alert-url', auth.authenticateTokenWithAdmin, appController.addAlertUrlDetails);

router.get('/api/logs', auth.authenticateToken, logController.getLogs);
router.get('/api/logs/hostnames', auth.authenticateToken, logController.getHostnames);
router.get('/api/logs/:logId/meta', auth.authenticateToken, logController.getLogMeta);
router.get('/api/logs/config/ttl', auth.authenticateTokenWithAdmin, logController.getLogsTTL);
router.patch('/api/logs/config/ttl', auth.authenticateTokenWithAdmin, logController.updateLogsTTL);
router.delete('/api/logs', auth.authenticateTokenWithAdmin, logController.deleteAllLogs);

module.exports = router;
