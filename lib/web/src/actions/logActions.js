import { http } from 'app/services/httpServices';
import { Notifications } from 'services/notifications';

export function getConsoleLogs (query, options = {}, callback) {
  return (dispatch) => {
    http.getConsoleLogs(query, options)
      .then((response) => {
        if (options.signal?.aborted) {
          return;
        }
        const consoleLogsData = response.data;
        callback(null, consoleLogsData);
      })
      .catch((error) => {
        if (error.response) {
          Notifications.showErrors(error);
        } else {
          Notifications.showErrors(error);
        }
        callback(error);
      });
  };
}

export function getLogsTTL (callback) {
  return (dispatch) => {
    http.getLogsTTL()
      .then((response) => {
        const data = response.data;
        callback(null, data);
      })
      .catch((error) => {
        if (error.response) {
          Notifications.showErrors(error);
        } else {
          Notifications.showErrors(error);
        }
        callback(error);
      });
  };
}

export function updateLogsTTL (query, callback) {
  return (dispatch) => {
    http.updateLogsTTL(query)
      .then((response) => {
        const data = response.data;
        callback(null, data);
      })
      .catch((error) => {
        if (error.response) {
          Notifications.showErrors(error);
        } else {
          Notifications.showErrors(error);
        }
        callback(error);
      });
  };
}

export function getLogMeta (logId, callback) {
  return (dispatch) => {
    http.getLogMeta(logId)
      .then((response) => {
        const data = response.data;
        callback(null, data);
      })
      .catch((error) => {
        if (error.response) {
          Notifications.showErrors(error);
        } else {
          Notifications.showErrors(error);
        }
        callback(error);
      });
  };
}

export function getHostnames (callback) {
  return (dispatch) => {
    http.getHostnames()
      .then((response) => {
        const data = response.data;
        callback(null, data);
      })
      .catch((error) => {
        if (error.response) {
          Notifications.showErrors(error);
        } else {
          Notifications.showErrors(error);
        }
        callback(error);
      });
  };
}

export function deleteAllLogs (callback) {
  return (dispatch) => {
    http.deleteAllLogs('/api/logs')
      .then((response) => {
        const data = response.data;
        callback(null, data);
      })
      .catch((error) => {
        if (error.response) {
          Notifications.showErrors(error);
        } else {
          Notifications.showErrors(error);
        }
        callback(error);
      });
  };
}
