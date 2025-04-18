<p align="center">
  <img src="https://github.com/user-attachments/assets/efac607f-4f41-4e60-8c8c-df3deb94a3da" width="256"/>

  <h3 align="center">Collect, Store, and Visualize Logs with a Single Module</h3>

  <p align="center">
    <a href="#setup">Setup</a> |
    <a href="https://github.com/errsole/errsole.js/blob/master/docs/advanced-configuration.md">Advanced Configuration</a> |
    <a href="https://github.com/errsole/errsole.js/blob/master/docs/advanced-logging-functions.md">Advanced Logging Functions</a>
  </p>

  <p align="center">
    <img src="https://github.com/user-attachments/assets/62746b2f-3cc6-4377-8284-3b6463ae2b9d" height="30"/>
    <img src="https://github.com/user-attachments/assets/baf5025c-d7e4-4344-baf1-65cc0613602e" height="30"/>
    <img src="https://github.com/user-attachments/assets/97b93168-722b-44be-a5a8-88aea0b3a792" height="30"/>
    <img src="https://github.com/user-attachments/assets/e83158ac-730d-46bc-bb62-3e55ac5ff693" height="30"/>
  </p>

  <p align="center">
    <img src="https://img.shields.io/github/v/release/errsole/errsole.js" alt="Release Version" />
    <img src="https://img.shields.io/github/last-commit/errsole/errsole.js" alt="Last Commit" />
    <img src="https://img.shields.io/github/license/errsole/errsole.js" alt="License" />
    <a href="https://coveralls.io/github/errsole/errsole.js">
      <img src="https://coveralls.io/repos/github/errsole/errsole.js/badge.svg" alt="Coverage Status" />
    </a>
  </p>
</p>

Errsole is an open-source logger for Node.js apps. It comes with a built-in log viewer to view, filter, and search your app logs.

https://github.com/user-attachments/assets/ddb68538-f6eb-4416-b761-e215328f177f

## Features

### Minimal Setup

Just include the Errsole package in your code—no need for dedicated servers, software installations, or complicated configurations.

### Logger++

Errsole automatically collects all logs from the Node.js console. Additionally, it provides advanced logging functions that support multiple log levels and the ability to attach metadata to logs. [Read More](https://github.com/errsole/errsole.js/blob/master/docs/advanced-logging-functions.md)

### Store Anywhere

Store your logs wherever you want—whether in a file or any database of your choice. You can also configure log rotation to specify how long logs should be retained.

### Log Viewer

View, filter, and search through your logs using the built-in Web Dashboard. Secure authentication and team management features ensure that only you and your team can access the logs.

### Critical Error Notifications

Get immediate notifications when your app crashes or encounters critical errors. The notification includes the error message, the app name, the environment, the server name, and a direct link to view the error in your logs.

## Benchmarks

A Node.js app using Errsole Logger can handle 90,000 more requests per minute than when using Elasticsearch and 70,000 more requests per minute than when using Amazon CloudWatch. [Read More](https://github.com/errsole/errsole.js/blob/master/docs/benchmarks.md)

<img src="https://github.com/user-attachments/assets/e193e016-a14a-46c1-92af-865b3be27df4" alt="errsole-vs-elasticsearch-benchmarks" width="800">

## Setup

#### Development Environment
For local development or scenarios where you prefer storing logs directly on the server, you can integrate Errsole with SQLite. When using SQLite, logs will be stored in a file on your server.

* [Errsole with SQLite](https://github.com/errsole/errsole.js/blob/master/docs/sqlite-storage.md)

#### Production Environment

In production environments, where centralized log storage is critical, Errsole offers multiple storage options to fit your needs:

* [Errsole with MySQL](https://github.com/errsole/errsole.js/blob/master/docs/mysql-storage.md)
* [Errsole with PostgreSQL](https://github.com/errsole/errsole.js/blob/master/docs/postgresql-storage.md)
* [Errsole with MongoDB](https://github.com/errsole/errsole.js/blob/master/docs/mongodb-storage.md)
* Errsole with AWS DynamoDB (Upcoming)

#### Advanced Configuration

* [Advanced Configuration](https://github.com/errsole/errsole.js/blob/master/docs/advanced-configuration.md)

#### Advanced Logging

* [Advanced Logging Functions](https://github.com/errsole/errsole.js/blob/master/docs/advanced-logging-functions.md)

#### Integrations

* [Winston with Errsole](https://github.com/errsole/errsole.js/blob/master/docs/winston-errsole.md)

## FAQs

* [How can I resolve the "Error: listen EADDRINUSE: address already in use :::8001" error?](https://github.com/errsole/errsole.js/discussions/91)
* [How can I run the Errsole Dashboard on a separate server from my app?](https://github.com/errsole/errsole.js/discussions/113)

## Useful Links

* **Encountering issues?** [Open an issue](https://github.com/errsole/errsole.js/issues/new) on our GitHub repository.

* **Have questions?** Use our [Q&A forum](https://github.com/errsole/errsole.js/discussions/categories/q-a).

* **Want to request a feature or share your ideas?** Use our [discussion forum](https://github.com/errsole/errsole.js/discussions/categories/general).

* **Want to contribute?** First, share your idea with the community in our [discussion forum](https://github.com/errsole/errsole.js/discussions/categories/general) to see what others are saying. Then, fork the repository, make your changes, and submit a pull request.

## License

[MIT](https://github.com/errsole/errsole.js/blob/master/LICENSE)
