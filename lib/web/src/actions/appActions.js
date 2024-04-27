import { http } from 'app/services/httpServices';
import { Notifications } from 'services/notifications';

export function checkUpdates (callback) {
  return (dispatch) => {
    http.checkUpdates()
      .then((response) => {
        const updateData = response.data;
        callback(null, updateData);
      })
      .catch((error) => {
        console.log(error);
        if (error.response) {
          Notifications.showErrors(error);
        } else {
          Notifications.showErrors(error);
        }
        callback(error);
      });
  };
}

export function getSlackDetails (callback) {
  return (dispatch) => {
    http.getSlackDetails()
      .then((response) => {
        const details = response.data;
        callback(null, details);
      })
      .catch((error) => {
        console.log(error);
        if (error.response) {
          Notifications.showErrors(error);
        } else {
          Notifications.showErrors(error);
        }
        callback(error);
      });
  };
}

export function addSlackDetails (data, callback) {
  return (dispatch) => {
    http.addSlackDetails(data)
      .then((response) => {
        const details = response.data;
        callback(null, details);
      })
      .catch((error) => {
        console.log(error);
        if (error.response) {
          Notifications.showErrors(error);
        } else {
          Notifications.showErrors(error);
        }
        callback(error);
      });
  };
}

export function deleteSlackDetails (callback) {
  return (dispatch) => {
    http.deleteSlackDetails()
      .then((response) => {
        const details = response.data;
        callback(null, details);
      })
      .catch((error) => {
        console.log(error);
        if (error.response) {
          Notifications.showErrors(error);
        } else {
          Notifications.showErrors(error);
        }
        callback(error);
      });
  };
}
