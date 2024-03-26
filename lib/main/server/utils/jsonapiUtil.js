const JSONAPISerializer = require('json-api-serializer');
const Serializer = new JSONAPISerializer({
  jsonapiObject: false
});

const Jsonapi = {};

Jsonapi.UserType = 'users';
Jsonapi.Logs = 'logs';

Serializer.register(Jsonapi.UserType, {});
Serializer.register(Jsonapi.Logs, {
  topLevelMeta: function (data, meta) {
    return {
      total: meta.count
    };
  }
});

Jsonapi.Serializer = Serializer;
module.exports = Jsonapi;
