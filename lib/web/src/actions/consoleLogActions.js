import { http } from 'app/services/httpServices';
import { Notifications } from 'services/notifications';

/** ******************  Logs ********************/

export function getConsoleLogs (query, callback) {
  return (dispatch) => {
    http.getConsoleLogs(query)
      .then((response) => {
        const consoleLogsData = response.data;
        callback(null, consoleLogsData);
      })
      .catch((error) => {
        if (error.response) {
          if (error.response.status !== 403) {
            Notifications.showErrors(error);
          }
        } else {
          Notifications.showErrors(error);
        }
        callback(error);
      });
  };
}
