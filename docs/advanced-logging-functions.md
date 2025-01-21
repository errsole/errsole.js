# Advanced Logging Functions

Errsole automatically collects all logs from the Node.js console. Additionally, it provides advanced logging functions that support multiple log levels.

### log / info

The `log` function is used to log messages or information. It can accept one or more arguments, which can be strings, numbers, JavaScript objects, or Error objects.

#### Example

```javascript
errsole.log('Logging a message');
errsole.log('Multiple', 'arguments', 'are supported');
errsole.log('Logging with a variable:', var1);
errsole.log(new Error('An error occurred'));
errsole.log('Logging with an error object:', errorObject);
```

### alert

The `alert` function logs a message and sends a notification to configured channels, such as Email or Slack. It accepts the same types of arguments as the `log` function.

#### Example

```javascript
errsole.alert('Alert! Something critical happened');
```

### error

The `error` function is specifically designed to log errors. It accepts the same types of arguments as the `log` function.

#### Example

```javascript
errsole.error(new Error('An error occurred'));
```

### warn

The `warn` function is used to log warning messages. It accepts the same types of arguments as the `log` function.

#### Example

```javascript
errsole.warn('This is a warning message');
```

### debug

The `debug` function logs debug information, typically used for troubleshooting during development. It accepts the same types of arguments as the `log` function.

#### Example

```javascript
errsole.debug('Debugging information');
```
### meta

With Errsole, you can attach metadata to your logs. This metadata can be any contextual information, such as HTTP requests or database query results. In the Errsole Web Dashboard, you can view this metadata in a clean JSON viewer without cluttering the log messages.

To attach metadata to your logs, use the `meta` function followed by the appropriate logging function (error, log, etc.).

#### Example

```javascript
errsole.meta({ reqBody: req.body, queryResults: results }).error(err);
errsole.meta({ email: req.body.email }).log('User logged in');
```

#### Note

The `meta` function must be the first function in the chain, followed by the desired logging function.

## Main Documentation

[Main Documentation](/README.md)
