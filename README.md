<p align="center">
  <img src="https://github.com/errsole/errsole.js/assets/3775513/e7499016-cb28-488d-a47d-f1ba24804d2b" width="256"/>

  <h3 align="center">Collect, Store, and Visualize Logs with a Single Module</h3>

<div align="center">
  <a href="https://github.com/errsole/errsole.js/releases" style="text-decoration: none;">
    <img src="https://img.shields.io/github/v/release/errsole/errsole.js" alt="Release Version" />
  </a>
  <a href="https://github.com/errsole/errsole.js/commits/master" style="text-decoration: none;">
    <img src="https://img.shields.io/github/last-commit/errsole/errsole.js" alt="GitHub last commit">
  </a>
  <a href="https://github.com/errsole/errsole.js?tab=MIT-1-ov-file#readme" style="text-decoration: none;">
    <img src="https://img.shields.io/github/license/errsole/errsole.js" alt="License" />
  </a>
  <a href="https://coveralls.io/github/errsole/errsole.js">
    <img src="https://coveralls.io/repos/github/errsole/errsole.js/badge.svg" alt="Coverage Status" />
  </a>
</div>

</p>

Errsole is an open-source logger for Node.js. It has a built-in web dashboard to view, filter, and search your app logs.

https://github.com/errsole/errsole.js/assets/3775513/b59424fa-c3b3-4a65-b603-e35499fe4263

## Features

* **Easy Setup:** Just insert the Errsole code snippet at the beginning of your app's main file. That's it!

* **Automated Log Collection:** Errsole automatically collects all your app logs directly from the Node.js console.

* **Customized Logging:** Errsole's custom logger provides multiple log levels, thereby enabling greater precision in logging. Additionally, you can include metadata with your logs and receive alerts for specific log events according to your preferences. [Read More](#custom-logging-functions)

* **Centralized Logging:** Errsole consolidates all your app logs from multiple servers into one centralized database. You can choose your preferred database system.

* **Interactive Web Dashboard:** Easily view, filter, and search your app logs using the Errsole Web Dashboard.

* **Secure Access Control:** Errsole comes with built-in authentication, ensuring that only you and your authorized development team can access the logs.

* **Error Notifications:** Errsole delivers notifications for app crashes and custom alerts directly to your Email or Slack.

* **Data Retention:** You can specify the number of days you wish to keep your app logs.

## Benchmarks

Errsole outperforms Elasticsearch by 15k requests per minute. [Read More](https://github.com/errsole/errsole.js/blob/master/docs/benchmarks.md)

<img src="https://github.com/user-attachments/assets/d29d9ccc-de39-4f80-a369-a650962f7291" alt="errsole-vs-elasticsearch-benchmarks" width="800">

## Setup

* [Errsole with SQLite for File-Based Log Storage](https://github.com/errsole/errsole.js/blob/master/docs/sqlite-storage.md)
* [Errsole with MongoDB](https://github.com/errsole/errsole.js/blob/master/docs/mongodb-storage.md)
* [Errsole with MySQL](https://github.com/errsole/errsole.js/blob/master/docs/mysql-storage.md)
* [Errsole with PostgreSQL](https://github.com/errsole/errsole.js/blob/master/docs/postgresql-storage.md)
* [Errsole with MariaDB](https://github.com/errsole/errsole.js/blob/master/docs/mariadb-storage.md)
* [Errsole with OracleDB](https://github.com/errsole/errsole.js/blob/master/docs/oracledb-storage.md)

## Web Dashboard Access

After completing the setup, you can access the Errsole Web Dashboard through the following methods:

1. **Local Environment:** Open your web browser and visit `http://localhost:8001/`.
2. **Remote Server:** If you have deployed Errsole on a remote server, use the server's IP address or domain name followed by the port number (e.g., YourServerIP:8001 or YourDomain:8001).

#### Note

If you initialized Errsole with a different port or specified a custom path, adjust the URL as follows:

1. Replace 8001 with your chosen port number.
2. Append your custom path to the end of the URL.

`http(s)://YourServerIP:CustomPort/YourCustomPath`

### Proxy Middleware Configuration

If you encounter issues accessing port 8001 due to firewall restrictions, or if you prefer to host the Errsole Web Dashboard on your primary domain/port, you can configure the Errsole Proxy Middleware in your app. Here is a step-by-step guide: [Proxy Middleware Configuration](https://github.com/errsole/errsole.js/blob/master/docs/proxy-middleware-configuration.md)

## Custom Logging Functions

### log / info

The log function is used to log messages or information. It can accept one or more arguments, which can be strings, numbers, JavaScript objects, or Error objects.

#### Example

```javascript
errsole.log('Logging a message');
errsole.log('Multiple', 'arguments', 'are supported');
errsole.log('Logging with a variable:', var1);
errsole.log(new Error('An error occurred'));
errsole.log('Logging with an error object:', errorObject);
```

### alert

The alert function logs a message and sends a notification to configured channels, such as Email or Slack. It accepts the same types of arguments as the log function.

#### Example

```javascript
errsole.alert('Alert! Something critical happened');
```

### error

The error function is specifically designed to log errors. It accepts the same types of arguments as the log function.

#### Example

```javascript
errsole.error(new Error('An error occurred'));
```

### warn

The warn function is used to log warning messages. It accepts the same types of arguments as the log function.

#### Example

```javascript
errsole.warn('This is a warning message');
```

### debug

The debug function logs debug information, typically used for troubleshooting during development. It accepts the same types of arguments as the log function.

#### Example

```javascript
errsole.debug('Debugging information');
```
### meta

In Errsole's custom logger, you can include metadata with your logs. This metadata can be any contextual information, such as HTTP requests or database query results. In the Errsole Web Dashboard, you can view this metadata in a clean JSON viewer without cluttering the log messages.

To include metadata in your logs, use the `meta` function followed by the appropriate logging function (error, log, etc.).

#### Example

```javascript
errsole.meta({ reqBody: req.body, queryResults: results }).error(err);
errsole.meta({ email: req.body.email }).log('User logged in');
```

#### Note

The `meta` function must be the first function in the chain, followed by the desired logging function.

## Contribution and Support

**Contribution:** We welcome contributions! If you have ideas for improvements, feel free to fork the repository, make your changes, and submit a pull request.

**Support:** Have questions, facing issues, or want to request a feature? [Open an issue](https://github.com/errsole/errsole.js/issues/new) on the GitHub repository.

## License

[MIT](https://github.com/errsole/errsole.js/blob/master/LICENSE)
