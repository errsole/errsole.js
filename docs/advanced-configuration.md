# Advanced Configuration

## Configuration Options

| **Option**          	| **Type**                                                                                                                                                                           	| **Description**                                                                                                                                                                                                               	|
|---------------------	|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------	|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------	|
| storage             	| [ErrsoleSQLite](/docs/sqlite-storage.md)<br>[ErrsoleMySQL](/docs/mysql-storage.md)<br>[ErrsolePostgres](/docs/postgresql-storage.md)<br>[ErrsoleMongoDB](/docs/mongodb-storage.md) 	| **Required.** Specify the storage backend along with connection details.                                                                                                                                                      	|
| exitOnException     	| boolean                                                                                                                                                                            	| **Optional.** Default: `true`. By default, Errsole exits the process after capturing an uncaught exception. To disable this behavior, set exitOnException to `false`.                                                         	|
| collectLogs         	| string[]                                                                                                                                                                           	| **Optional.** Default: `['error', 'info']`. By default, Errsole collects both error and info logs. To collect only error logs, set this to `['error']`. To disable log collection entirely, set this to an empty array, `[]`. 	|
| enableConsoleOutput 	| boolean                                                                                                                                                                            	| **Optional.** Control whether log output is shown in the console.                                                                                                                                                             	|
| enableDashboard     	| boolean                                                                                                                                                                            	| **Optional.** Default: `true`. Enable or disable the web dashboard feature.                                                                                                                                                   	|
| port                	| number                                                                                                                                                                             	| **Optional.** Default: `8001`. Specify the network port for the web dashboard.                                                                                                                                                	|
| path                	| string                                                                                                                                                                             	| **Optional.** Default: `/`. Define the base path for accessing the web dashboard.                                                                                                                                             	|
| appName             	| string                                                                                                                                                                             	| **Optional.** Specify the name of the app.                                                                                                                                                                                    	|
| environmentName     	| string                                                                                                                                                                             	| **Optional.** Default: `process.env.NODE_ENV`. Specify the deployment environment.                                                                                                                                            	|
| serverName          	| string                                                                                                                                                                             	| **Optional.** Default: the hostname of the machine. Specify the name of the server.                                                                                                                                           	|

### Example

```javascript
errsole.initialize({
  storage: new ErrsoleSQLite(logsFile),
  exitOnException: true,
  collectLogs: ['error', 'info'],
  enableConsoleOutput: true,
  enableDashboard: true,
  port: 8001,
  path: '/',
  appName: 'your-app-name',
  environmentName: 'your-environment-name',
  serverName: 'your-server-name'
});
```

## Email Integration (For Critical Error Notifications)

| **Option**                    	| **Type** 	| **Description**                                                          	|
|-------------------------------	|----------	|--------------------------------------------------------------------------	|
| integrations.email            	| Object   	| **Optional.** SMTP configuration object for sending email notifications. 	|
| integrations.email.host       	| string   	| **Required.** SMTP host or IP address.                                   	|
| integrations.email.port       	| number   	| **Required.** SMTP port number.                                          	|
| integrations.email.username   	| string   	| **Required.** SMTP username.                                             	|
| integrations.email.password   	| string   	| **Required.** SMTP password.                                             	|
| integrations.email.sender     	| string   	| **Required.** Email address from which notifications are sent.           	|
| integrations.email.recipients 	| string[] 	| **Required.** List of email addresses to receive notifications.          	|

### Example

```javascript
errsole.initialize({
  storage: new ErrsoleSQLite(logsFile),
  appName: 'your-app-name',
  integrations: {
    email: {
      host: 'smtp.example.com',
      port: 587,
      username: 'your-smtp-username',
      password: 'your-smtp-password',
      sender: 'notifications@example.com',
      recipients: ['dev1@example.com', 'dev2@example.com']
    }
  }
});
```

## Slack Integration (For Critical Error Notifications)

| **Option**             	| **Type** 	| **Description**                                            	|
|------------------------	|----------	|------------------------------------------------------------	|
| integrations.slack     	| Object   	| **Optional.** Slack configuration object.                  	|
| integrations.slack.url 	| string   	| **Required.** Slack Webhook URL for sending notifications. 	|

### Example

```javascript
errsole.initialize({
  storage: new ErrsoleSQLite(logsFile),
  appName: 'your-app-name',
  integrations: {
    slack: {
      url: 'https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX'
    }
  }
});
```

## Main Documentation

[Main Documentation](/README.md)
