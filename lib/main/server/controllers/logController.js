const Jsonapi = require('../utils/jsonapiUtil');
const { getStorageConnection } = require('../storageConnection');
const helpers = require('../utils/helpers');

exports.getLogs = async (req, res) => {
  try {
    const query = req.query || {};
    let searchTerms;
    if (query.search_terms) {
      searchTerms = query.search_terms.split(',');
    }
    if (query.limit) {
      query.limit = parseInt(query.limit);
    }
    if (query.levels) {
      query.levels = query.levels.split(',').map((item) => item.trim());
    }
    if (query.level_json) {
      query.level_json =
        query.level_json && JSON.parse(query.level_json).length === 0
          ? [{}]
          : JSON.parse(query.level_json);
    }
    if (query.hostnames) {
      query.hostnames =
        query.hostnames && JSON.parse(query.hostnames).length === 0
          ? []
          : JSON.parse(query.hostnames);
    }

    const storageConnection = getStorageConnection();
    let logs = {};
    if (searchTerms) {
      logs = await storageConnection.searchLogs(searchTerms, query);
    } else {
      logs = await storageConnection.getLogs(query);
    }
    if (logs && logs.items) {
      res.send(Jsonapi.Serializer.serialize(Jsonapi.LogType, logs.items, logs.filters));
    } else {
      const errorData = [
        {
          error: 'Bad Request',
          message: (logs && logs.error) ? logs.error : 'invalid request'
        }
      ];
      res.status(400).send({ errors: errorData });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({
      errors: [
        {
          error: 'Internal Server Error',
          message: error && error.message ? error.message : 'An unexpected error occurred'
        }
      ]
    });
  }
};

exports.getLogsTTL = async (req, res) => {
  try {
    const storageConnection = getStorageConnection();
    const result = await storageConnection.getConfig('logsTTL');
    if (result && result.item) {
      res.send(Jsonapi.Serializer.serialize(Jsonapi.LogType, result.item));
    } else {
      const errorData = [
        {
          error: 'Bad Request',
          message: (result && result.error) ? result.error : 'invalid request'
        }
      ];
      res.status(400).send({ errors: errorData });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({
      errors: [
        {
          error: 'Internal Server Error',
          message: error && error.message ? error.message : 'An unexpected error occurred'
        }
      ]
    });
  }
};

exports.updateLogsTTL = async (req, res) => {
  try {
    const { ttl } = helpers.extractAttributes(req.body);
    if (ttl) {
      const storageConnection = getStorageConnection();
      const result = await storageConnection.setConfig('logsTTL', ttl);
      if (result && result.item) {
        await storageConnection.ensureLogsTTL();
        res.send(Jsonapi.Serializer.serialize(Jsonapi.LogType, result.item));
      } else {
        const errorData = [
          {
            error: 'Bad Request',
            message: (result && result.error) ? result.error : 'invalid request'
          }
        ];
        res.status(400).send({ errors: errorData });
      }
    } else {
      const errorData = [
        {
          error: 'Bad Request',
          message: 'invalid request'
        }
      ];
      res.status(400).send({ errors: errorData });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({
      errors: [
        {
          error: 'Internal Server Error',
          message: error && error.message ? error.message : 'An unexpected error occurred'
        }
      ]
    });
  }
};

exports.getLogMeta = async (req, res) => {
  const logId = req.params.logId;
  try {
    if (logId) {
      const storageConnection = getStorageConnection();
      const result = await storageConnection.getMeta(logId);
      if (result && result.item) {
        res.send(Jsonapi.Serializer.serialize(Jsonapi.LogType, result.item));
      } else {
        const errorData = [
          {
            error: 'Bad Request',
            message: 'invalid request'
          }
        ];
        res.status(400).send({ errors: errorData });
      }
    } else {
      const errorData = [
        {
          error: 'Bad Request',
          message: 'invalid request'
        }
      ];
      res.status(400).send({ errors: errorData });
    }
  } catch (error) {
    console.error(error);
    if (error.message === 'storageConnection.getMeta is not a function') {
      res.send(Jsonapi.Serializer.serialize(Jsonapi.LogType, { id: logId, meta: '{}' }));
    } else {
      res.status(500).send({
        errors: [
          {
            error: 'Internal Server Error',
            message: error && error.message ? error.message : 'An unexpected error occurred'
          }
        ]
      });
    }
  }
};

exports.getHostnames = async (req, res) => {
  try {
    const storageConnection = getStorageConnection();
    const result = await storageConnection.getHostnames();
    if (result && result.items) {
      const data = {
        hostnames: result.items
      };
      res.send(Jsonapi.Serializer.serialize(Jsonapi.LogType, data));
    } else {
      const errorData = [
        {
          error: 'Bad Request',
          message: (result && result.error) ? result.error : 'invalid request'
        }
      ];
      res.status(400).send({ errors: errorData });
    }
  } catch (error) {
    console.error(error);
    if (error.message === 'storageConnection.getHostnames is not a function') {
      res.send(Jsonapi.Serializer.serialize(Jsonapi.LogType, { }));
    } else {
      res.status(500).send({
        errors: [
          {
            error: 'Internal Server Error',
            message: error && error.message ? error.message : 'An unexpected error occurred'
          }
        ]
      });
    }
  }
};
