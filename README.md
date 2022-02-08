# Errsole

[Capture, replay, and debug errors in your Node.js server](https://github.com/errsole/errsole.js)

[![npm version](https://badge.fury.io/js/errsole.svg)](https://badge.fury.io/js/errsole)

## Features

### View your Node.js errors and their root cause
Errsole captures all errors raised in your Node.js app and the HTTP requests that caused the errors. You can view all your app errors and the root cause of each error in one place.

### Debug your server code in real-time
Errsole creates a clone of your Node.js app in the server and provides a debugger interface to the app clone. You can replay the captured errors in the app clone and debug the server code in real-time. Your users are not impacted while you debug the server code.

### Collaborate with your team members
Add developers to your app team. Then your team members can view, debug, and fix errors raised in your Node.js app.

## Installation and Usage
1. Errsole is a Node.js module. You can install this module using the `npm install` command:
    ```bash
    npm install errsole
    ```
2. Click on the button below to get the Errsole code snippet. Put the code snippet at the top of your app's main file.\
<a href="https://www.errsole.com/get-app-token"><img src="https://www.errsole.com/images/generate-token-button.png" alt="GENERATE TOKEN" width="175"></a>


### Example
```javascript
/**
 * Put the Errsole code snippet at the top of your app's main file
 */
const errsole = require('errsole')
errsole.initialize({
  framework: 'express',
  token: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
})

/**
 * Your app code starts here
 */
const express = require('express')
const app = express()

app.get('/', function (req, res) {
  res.send('Hello World')
})

app.listen(3000)
```

## Demo Video
<a href="https://youtu.be/u6Qwm1boDig"><img src="https://www.errsole.com/images/errsole-demo-video.jpeg" alt="Errsole Demo Video" width="640"></a>

## Support
If you run into any issues, please email us at [support@errsole.com](mailto:support@errsole.com).\
For bug reports, please [open an issue on GitHub](https://github.com/errsole/errsole.js/issues/new).

## License
[MIT](LICENSE)
