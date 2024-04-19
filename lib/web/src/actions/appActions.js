import { http } from 'app/services/httpServices';

export function checkUpdates (callback) {
  return (dispatch) => {
    http.checkUpdates()
      .then((response) => {
        const updateData = response.data;
        callback(null, updateData);
      })
      .catch((error) => {
        callback(error);
      });
  };
}
