require("dotenv").config();

const express = require("express");
const {
  CloudWatchLogsClient,
  PutLogEventsCommand,
  CreateLogStreamCommand,
} = require("@aws-sdk/client-cloudwatch-logs");
const cloudWatchClient = new CloudWatchLogsClient({
  region: process.env.AWS_REGION,
});

const logGroupName = process.env.LOG_GROUP_NAME;
const logStreamName = process.env.LOG_STREAM_NAME;

async function createLogStream() {
  try {
    await cloudWatchClient.send(
      new CreateLogStreamCommand({ logGroupName, logStreamName })
    );
  } catch (err) {
    console.error("Error creating log stream:", err);
  }
}

createLogStream();

let sequenceToken = null;

async function logToCloudWatch(message) {
  try {
    const structuredMessage = JSON.stringify({
      timestamp: new Date().toISOString(),
      level: "info",
      message: message,
    });

    const params = {
      logGroupName,
      logStreamName,
      logEvents: [{ message: structuredMessage, timestamp: Date.now() }],
      sequenceToken,
    };

    const data = await cloudWatchClient.send(new PutLogEventsCommand(params));
    sequenceToken = data.nextSequenceToken;
  } catch (err) {
    console.error("Error logging to CloudWatch:", err);
  }
}

const app = express();

// Middleware to log HTTP requests
app.use((req, res, next) => {
  logToCloudWatch(`${req.method} ${req.url} from ${req.ip}`);
  next();
});

// Health check endpoint
app.get("/health", (req, res) => {
  logToCloudWatch("Health check received");
  res.status(200).send("Server is healthy");
});

app.get("/", (req, res) => {
  logToCloudWatch("Hello World");
  res.send("Hello World");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logToCloudWatch(`Server is running on port ${PORT}`);
});
