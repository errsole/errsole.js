'use strict';

const os = require('os');
const Logs = require('./logs');
const ExpressApp = require('./server');
const Alerts = require('./server/utils/alerts');

const Main = {
  appName: null,
  environmentName: process.env.NODE_ENV || null,
  serverName: null,
  pendingAlerts: [],
  isInitializated: false,

  initialize (options) {
    this.loadPackageInfo();
    this.setupConfiguration(options);
    Logs.initialize(options);
    this.startServer(options);
    this.handleUncaughtExceptions(options.exitOnException);
    this.isInitializated = true;
    this.flushAlerts();
  },

  loadPackageInfo () {
    try {
      this.serverName = os.hostname() || null;
      const packageJSON = require('../../../../package.json');
      this.appName = packageJSON.name || null;
    } catch (err) {
    }
  },

  setupConfiguration (options) {
    this.appName = options.appName || this.appName;
    this.environmentName = options.environmentName || this.environmentName;
    this.serverName = options.serverName || this.serverName;
    options.port = parseInt(options.port, 10) || 8001;
    options.enableDashboard = typeof options.enableDashboard === 'boolean' ? options.enableDashboard : true;
    options.exitOnException = typeof options.exitOnException === 'boolean' ? options.exitOnException : true;
  },

  startServer (options) {
    if (options.enableDashboard) {
      ExpressApp.addStorage(options);
      ExpressApp.addPath(options);
      ExpressApp.listen(options.port, () => {
        const basePath = options.path || '';
        console.log(`Errsole Dashboard is accessible at http://localhost:${options.port}${basePath}`);
      });
    } else {
      console.log('Errsole Dashboard is disabled: You have disabled the Errsole Dashboard in the Errsole module configuration.');
    }
  },

  async customLogger (level, message, metadata) {
    Logs.logCustomMessage(level, message, metadata);
    if (level === 'alert') {
      const messageExtraInfo = {
        appName: this.appName,
        environmentName: this.environmentName,
        serverName: this.serverName
      };
      if (this.isInitializated) {
        await Alerts.customLoggerAlert(message, messageExtraInfo);
      } else {
        this.pendingAlerts.push({ message, messageExtraInfo });
      }
    }
  },

  async handleUncaughtExceptions (exitOnException) {
    process.on('uncaughtException', async (err, origin) => {
      const errorOrigin = `Origin: ${origin}`;
      const errorMessage = err.stack || err.message;
      console.error(`${errorOrigin}\n${errorMessage}`);
      const messageExtraInfo = {
        appName: this.appName,
        environmentName: this.environmentName,
        serverName: this.serverName
      };
      if (this.isInitializated) {
        await Alerts.handleUncaughtExceptions(`${errorOrigin}\n${errorMessage}`, messageExtraInfo);
        await Logs.flushLogs();
      }
      if (exitOnException) process.exit(1);
    });
  },

  async flushAlerts () {
    const alertsToFlush = [...this.pendingAlerts];
    this.pendingAlerts = [];

    try {
      for (let i = 0; i < alertsToFlush.length; i++) {
        const { message, messageExtraInfo } = alertsToFlush[i];
        await Alerts.customLoggerAlert(message, messageExtraInfo);
      }
    } catch (err) {
      console.error('Failed to flush alerts:', err);
    }
  }

};

module.exports = Main;
