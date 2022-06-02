# Errsole
[![npm version](https://badge.fury.io/js/errsole.svg)](https://badge.fury.io/js/errsole)

[Capture, replay, and debug errors in your Node.js server](https://github.com/errsole/errsole.js)

## Installation and Usage
1. Errsole is a Node.js module. You can install this module using the `npm install` command:

    ```bash
    npm install errsole
    ```

2. Click on the button below to get the Errsole code snippet. Put the code snippet at the top of your app's main file.

    <a href="https://www.errsole.com/get-app-token"><img src="https://www.errsole.com/images/generate-token-button.png" alt="GENERATE TOKEN" width="175"></a>

    #### Example
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

### Advanced Configuration
| Name           | Type    | Default | Description                                                                                                                                                                                                                              |
|----------------|---------|---------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| framework      | string  |         | Required. Your Node.js framework name.                                                                                                                                                                                                   |
| token          | string  |         | Required. [Click here](https://www.errsole.com/get-app-token) to generate a unique token.                                                                                                                                                                                          |
| enableDebugger | boolean | true    | Optional. If false, the debugger is disabled.                                                                                                                                                                                            |
| editCode       | boolean | false   | Optional. If true, you can edit code while debugging an error.<br>Setting true in staging and production environments is not recommended because your developers can run arbitrary code on your production server.                       |
| evalExpression | boolean | false   | Optional. If true, you can evaluate JavaScript expressions while debugging an error.<br>Setting true in staging and production environments is not recommended because your developers can run arbitrary code on your production server. |

#### Example
```javascript
/**
 * Put the Errsole code snippet at the top of your app's main file
 */
const errsole = require('errsole')
errsole.initialize({
  framework: 'express',
  token: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
  enableDebugger: true,
  editCode: false, // Set true in development and testing environments
  evalExpression: false // Set true in development and testing environments
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

## Features

### View your Node.js errors and their root cause
Errsole captures all errors raised in your Node.js app and the HTTP requests that caused the errors. View all your Node.js errors and the root cause of each error in one place.

### View session logs
When an error occurs, Errsole saves the error and the series of HTTP requests the user has made before the error. These are requests made by a single user to whom the error has occurred. With this information, you can see what the user has done before the error and which user activities have caused the error.

### Debug your server code in real-time
Errsole creates a clone of your Node.js app in your server and provides a debugger interface to the app clone. You can replay the captured errors in the app clone and debug the server code in real-time. Your users are not impacted while you debug the server code.

### Collaborate with your team members
Add developers to your app team. Then the developers can view, replay, and debug errors raised in your Node.js app.

## Demo Video
<a href="https://youtu.be/u6Qwm1boDig"><img src="https://www.errsole.com/images/errsole-demo-video.jpeg" alt="Errsole Demo Video" width="640"></a>

## Support
* We appreciate your star, it helps!
* If you run into any issues, please email us at [support@errsole.com](mailto:support@errsole.com).
* For bug reports, please [open an issue on GitHub](https://github.com/errsole/errsole.js/issues/new).

## License
[MIT](LICENSE)
