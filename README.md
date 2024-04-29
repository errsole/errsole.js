<p align="center">
  <img src="https://github.com/errsole/errsole.js/assets/3775513/e7499016-cb28-488d-a47d-f1ba24804d2b" width="256"/>

  <h3 align="center">Node.js Logger with a Built-in Dashboard</h3>
</p>

Errsole is an open-source logger for Node.js. It has a built-in web dashboard to view, filter, and search your app logs.

https://github.com/errsole/errsole.js/assets/3775513/b8d7025d-9b82-464a-954a-8e27be51fd3a

## Features

* **Easy Setup:** Just insert the Errsole code snippet at the beginning of your app's main file. That's it!

* **Automated Log Collection:** Errsole automatically collects all your app logs directly from the Node.js console.

* **Customized Logging:** In contrast to the Node.js console, which categorizes logs as either info or error, Errsole's custom logger provides multiple log levels. This allows for greater precision in logging. Additionally, you can include metadata with your logs and receive alerts for specific log events according to your preferences.

* **Centralized Logging:** Errsole consolidates all your app logs from multiple servers into one centralized database. You can choose your preferred database system.

* **Interactive Web Dashboard:** Easily view, filter, and search your app logs using the Errsole web dashboard.

* **Secure Access Control:** Errsole comes with built-in authentication, ensuring that only you and your authorized development team can access the logs.

* **Error Notifications:** Errsole delivers notifications for app crashes and custom alerts directly to your Email or Slack.

## Setup

* [Errsole with MongoDB](docs/mongodb-storage.md)
* [Errsole with MySQL](docs/mysql-storage.md)
* [Errsole with PostgreSQL](docs/postgresql-storage.md)
* [Errsole with SQLite](docs/sqlite-storage.md)
* [Errsole with MariaDB](docs/mariadb-storage.md)
* [Errsole with OracleDB](docs/oracledb-storage.md)

## Web Dashboard

After the setup, access the Errsole Web Dashboard at [http://localhost:8001/](http://localhost:8001/). If you have configured Errsole with a different port and path during initialization, remember to replace "8001" in the URL with your chosen port number and add your custom path to the end of the URL.

## Contribution and Support

**Contribution:** We welcome contributions! If you have ideas for improvements, feel free to fork the repository, make your changes, and submit a pull request.

**Support:** Have questions, facing issues, or want to request a feature? [Open an issue](https://github.com/errsole/errsole.js/issues/new) on the GitHub repository.

## License

[MIT](LICENSE)
