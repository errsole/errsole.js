const Jsonapi = require('../utils/jsonapiUtil');
const { getStorageConnection } = require('../storageConnection');

exports.getLogs = async (req, res) => {
  try {
    const query = req.query || {};
    let searchTerms;
    if (query.search_terms) {
      searchTerms = query.searchTerms.split(',');
    }
    if (query.levels) {
      query.levels = query.levels.split(',').map(item => item.trim());
    }
    const storageConnection = getStorageConnection();
    let logs = {};
    if (searchTerms) {
      logs = await storageConnection.searchLogs(searchTerms, query);
    } else {
      logs = await storageConnection.getLogs(query);
    }
    if (logs && logs.items) {
      res.send(Jsonapi.Serializer.serialize(Jsonapi.UserType, logs.items));
    } else {
      const errorData = [{
        error: 'Bad Request',
        message: 'invalid request'
      }];
      res.status(400).send({ errors: errorData });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({
      errors: [{
        error: 'Internal Server Error',
        message: 'An unexpected error occurred'
      }]
    });
  }
};
