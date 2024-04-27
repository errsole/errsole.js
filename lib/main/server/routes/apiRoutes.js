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
router.post('/api/users/', auth.authenticateToken, userController.addUser);
router.delete('/api/users/:userId', auth.authenticateToken, userController.removeUser);

router.get('/api/apps/check-updates', auth.authenticateToken, appController.checkUpdates);
router.post('/api/apps/integrations/slack', auth.authenticateToken, appController.addSlack);
router.delete('/api/apps/integrations/slack', auth.authenticateToken, appController.deleteSlack);
router.get('/api/apps/integrations/slack', auth.authenticateToken, appController.getSlack);

router.get('/api/logs', auth.authenticateToken, logController.getLogs);

module.exports = router;
