const JSONAPISerializer = require('json-api-serializer');
const Serializer = new JSONAPISerializer({
  jsonapiObject: false
});

const Jsonapi = {};

Jsonapi.UserType = 'users';
Jsonapi.AppType = 'apps';
Jsonapi.LogType = 'logs';

Serializer.register(Jsonapi.UserType, {});
Serializer.register(Jsonapi.AppType, {});
Serializer.register(Jsonapi.LogType, {
  topLevelMeta: function (data, filters) {
    return {
      filters
    };
  }
});

Jsonapi.Serializer = Serializer;
module.exports = Jsonapi;
