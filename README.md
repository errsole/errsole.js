# Errsole

[![npm version](https://badge.fury.io/js/errsole.svg)](https://badge.fury.io/js/errsole)

## Features

### View your app errors and their root cause
Errsole captures all errors raised in your Node.js app and the HTTP requests that caused the errors. You can view all your app errors and the root cause of each error in one place.

### Debug your app code in real-time
Errsole creates a clone of your live app and provides a debugger interface to the app clone. You can replay the captured errors and debug the app code in real-time. Your users are not impacted while you debug the app code.

### Collaborate with your team members
You can add developers to your app team. Your team members can view, debug, and fix errors raised in your app.

## Demo
[![Watch the video](https://img.youtube.com/vi/u6Qwm1boDig/maxresdefault.jpg)](https://youtu.be/u6Qwm1boDig)

## Installation and Usage
1. Errsole is a Node.js module. You can install this module using the `npm install` command:
```bash
npm install errsole
```
2. Click on the link below to get the Errsole code snippet. Put the code snippet at the top of your app's main file.\
https://errsole.com/#apps/get-app-token

### Example
```javascript
/**
 * Put the Errsole code snippet at the top of your app's main file
 */
require('errsole').initialize({
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

## Support
If you run into any issues, please email us at [support@errsole.com](mailto:support@errsole.com).\
For bug reports, please [open an issue on GitHub](https://github.com/errsole/errsole/issues/new).

## License
[MIT](LICENSE)
