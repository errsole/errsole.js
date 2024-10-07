<p align="center">
  <img src="https://github.com/errsole/errsole.js/assets/3775513/e7499016-cb28-488d-a47d-f1ba24804d2b" width="256"/>

  <h3 align="center">Collect, Store, and Visualize Logs with a Single Module</h3>

  <div align="center">
  <img src="https://img.shields.io/github/v/release/errsole/errsole.js" alt="Release Version" />
  <img src="https://img.shields.io/github/last-commit/errsole/errsole.js" alt="Last Commit" />
  <img src="https://img.shields.io/github/license/errsole/errsole.js" alt="License" />
  <a href="https://coveralls.io/github/errsole/errsole.js">
    <img src="https://coveralls.io/repos/github/errsole/errsole.js/badge.svg" alt="Coverage Status" />
  </a>
  </div>
</p>

Errsole is an open-source logger for Node.js. It has a built-in web dashboard to view, filter, and search your app logs.

https://github.com/errsole/errsole.js/assets/3775513/b59424fa-c3b3-4a65-b603-e35499fe4263

## Features

### Minimal Setup

Just include the Errsole package in your code—no need for dedicated servers, software installations, or complicated configurations.

### Logger++

Errsole automatically collects all logs from the Node.js console. Additionally, it provides a custom logger with multiple log levels and allows you to include metadata with your logs for better context. [Read More](#custom-logging-functions)

### Store Anywhere

Store your logs wherever you want—whether in a file or any database of your choice. You can also configure log rotation to specify how long logs should be retained.

### Web Dashboard

View, filter, and search through your logs using the built-in Web Dashboard. Secure authentication and team management features ensure that only you and your team can access the logs.

### Critical Error Notifications

Get immediate notifications when your app crashes or encounters critical errors. The notification includes the error message, the app name, the environment, the server name, and a direct link to view the error in your logs.

## Benchmarks

A Node.js app using Errsole Logger can handle 90,000 more requests per minute than when using Elasticsearch and 70,000 more requests per minute than when using Amazon CloudWatch. [Read More](https://github.com/errsole/errsole.js/blob/master/docs/benchmarks.md)

<img src="https://github.com/user-attachments/assets/e193e016-a14a-46c1-92af-865b3be27df4" alt="errsole-vs-elasticsearch-benchmarks" width="800">

## Setup

#### File-based Logging

* [Errsole with SQLite](https://github.com/errsole/errsole.js/blob/master/docs/sqlite-storage.md)

#### Centralized Logging

* [Errsole with MongoDB](https://github.com/errsole/errsole.js/blob/master/docs/mongodb-storage.md)
* [Errsole with MySQL](https://github.com/errsole/errsole.js/blob/master/docs/mysql-storage.md)
* [Errsole with PostgreSQL](https://github.com/errsole/errsole.js/blob/master/docs/postgresql-storage.md)

#### Advanced Configuration

* [Advanced Configuration](https://github.com/errsole/errsole.js/blob/master/docs/advanced-configuration.md)

#### Custom Logging Functions

* [Custom Logging Functions](https://github.com/errsole/errsole.js/blob/master/docs/custom-logging-functions.md)

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

## Useful Links

* [FAQs](https://github.com/errsole/errsole.js/discussions/categories/faqs)

* **Encountering issues?** [Open an issue](https://github.com/errsole/errsole.js/issues/new) on our GitHub repository.

* **Have questions?** Use our [Q&A forum](https://github.com/errsole/errsole.js/discussions/categories/q-a).

* **Want to request a feature or share your ideas?** Use our [discussion forum](https://github.com/errsole/errsole.js/discussions/categories/general).

* **Want to contribute?** First, share your idea with the community in our [discussion forum](https://github.com/errsole/errsole.js/discussions/categories/general) to see what others are saying. Then, fork the repository, make your changes, and submit a pull request.

## License

[MIT](https://github.com/errsole/errsole.js/blob/master/LICENSE)
