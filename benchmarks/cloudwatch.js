const express = require('express');
const { CloudWatchLogsClient, PutLogEventsCommand, CreateLogStreamCommand } = require('@aws-sdk/client-cloudwatch-logs');
const cloudWatchClient = new CloudWatchLogsClient({ region: 'us-east-1' });

const logGroupName = 'benchmark';
const logStreamName = 'cloudwatch';

async function createLogStream () {
  try {
    await cloudWatchClient.send(new CreateLogStreamCommand({ logGroupName, logStreamName }));
  } catch (err) {}
}

createLogStream();

let sequenceToken = null;

async function logToCloudWatch (message) {
  try {
    const params = {
      logGroupName,
      logStreamName,
      logEvents: [{ message, timestamp: Date.now() }],
      sequenceToken
    };
    const data = await cloudWatchClient.send(new PutLogEventsCommand(params));
    sequenceToken = data.nextSequenceToken;
  } catch (err) {}
}

const app = express();

app.get('/', (req, res) => {
  logToCloudWatch('Hello World');
  res.send('Hello World');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logToCloudWatch(`Server is running on port ${PORT}`);
});
