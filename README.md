<p align="center">
  <img src="https://github.com/errsole/errsole.js/assets/3775513/e7499016-cb28-488d-a47d-f1ba24804d2b" width="256"/>

  <h3 align="center">Node.js Logger with a Built-in Web Dashboard</h3>
</p>

Errsole is a Node.js logger with a built-in web dashboard. In this dashboard, you can easily view, filter, and search your app logs.

## Features

* **Easy Setup:** Just insert the Errsole code snippet at the beginning of your app's main file. That's it!
* **Automated Log Collection:** Errsole automatically collects all your app logs directly from the Node.js console.
* **Centralized Logging:** Errsole consolidates all your app logs from multiple servers into one centralized database. You can choose your preferred database system.
* **Interactive Web Dashboard:** Easily view, filter, and search your app logs using the Errsole web dashboard.
* **Secure Access Control:** Errsole comes with built-in authentication, ensuring that only you and your authorized development team can access the logs.

## Setup

* [Errsole with MongoDB](docs/mongodb-storage.md)

## Errsole Dashboard

After the setup, access the Errsole Web Dashboard at [http://localhost:8001/](http://localhost:8001/). If you have configured Errsole with a different port during initialization, make sure to replace "8001" in the URL with your specific port number.

## Upcoming Features

* **Search Logs:** We are adding a new feature to the Errsole Dashboard that enables you to search your app logs over a specified time period.
* **Custom Logger:** We are introducing a custom logger that supports all log levels (error, warn, info, debug) and allows custom JSON logging.
* **Error Notifications:** We will implement a notification system that sends alerts about errors directly to your Email or Slack.

## Contribution and Support

**Contribution:** We welcome contributions! If you have ideas for improvements, feel free to fork the repository, make your changes, and submit a pull request.

**Support:** Have questions, facing issues, or want to request a feature? [Open an issue](https://github.com/errsole/errsole.js/issues/new) on the GitHub repository.

## License

[MIT](LICENSE)
