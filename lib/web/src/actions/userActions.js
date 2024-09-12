import { http } from 'app/services/httpServices';
import { Notifications } from 'services/notifications';

export function getNumberOfUsers (callback) {
  return (dispatch) => {
    http.getNumberOfUsers()
      .then((response) => {
        const userData = response.data.data;
        callback(null, userData);
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

export function register (userData, callback) {
  return (dispatch) => {
    http.register(userData)
      .then((response) => {
        const userDetails = response.data.data;
        const token = userDetails.attributes.token;
        saveToken(token);
        callback(null, userDetails);
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

export function login (userData, callback) {
  return (dispatch) => {
    http.login(userData)
      .then((response) => {
        const userDetails = response.data.data;
        if (userDetails && userDetails.attributes) {
          const token = userDetails.attributes.token;
          saveToken(token);
        }
        callback(null, userDetails);
      })
      .catch((error) => {
        console.log(error);
        if (error.response) {
          Notifications.showErrors(error);
        } else {
          console.log(error);
          Notifications.showErrors(error);
        }
        callback(error);
      });
  };
}

function getUserProfileSuccess (userData) {
  return {
    type: 'GET_USER_PROFILE_SUCCESS',
    userData
  };
}

export function getUserProfile (callback) {
  return (dispatch) => {
    http.getUserProfile()
      .then((response) => {
        const userDetails = response.data.data;
        dispatch(getUserProfileSuccess(userDetails));
        callback(null, userDetails);
      })
      .catch((error) => {
        if (error.response) {
          if (error.response.status === 401) {
            window.localStorage.removeItem('errsole-jwt-token');
            const { protocol, hostname, port, pathname } = window.location;
            const path = `${protocol}//${hostname}${port ? ':' + port : ''}${pathname}`;
            dispatch(resetUserProfileState());
            window.location.href = path + '#/login';
          } else {
            Notifications.showErrors(error);
          }
        } else {
          Notifications.showErrors(error);
        }
        callback(error);
      });
  };
}

export function getAllUsers (callback) {
  return (dispatch) => {
    http.getAllUsers()
      .then((response) => {
        const usersDetails = response.data.data;
        callback(null, usersDetails);
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

export function updateProfile (data, callback) {
  return (dispatch) => {
    http.updateProfile(data)
      .then((response) => {
        const result = response.data.data;
        callback(null, result);
      })
      .catch((error) => {
        if (error.response && error.response.status === 401) {
          const { protocol, hostname, port, pathname } = window.location;
          const path = `${protocol}//${hostname}${port ? ':' + port : ''}${pathname}`;
          window.location.href = path + '#/login';
        } else {
          Notifications.showErrors(error);
        }
        callback(error);
      });
  };
}

export function updatePassword (data, callback) {
  return (dispatch) => {
    http.updatePassword(data)
      .then((response) => {
        const result = response.data.data;
        callback(null, result);
      })
      .catch((error) => {
        if (error.response && error.response.status === 401) {
          const { protocol, hostname, port, pathname } = window.location;
          const path = `${protocol}//${hostname}${port ? ':' + port : ''}${pathname}`;
          window.location.href = path + '#/login';
        } else {
          Notifications.showErrors(error);
        }
        callback(error);
      });
  };
}

function resetUserProfileState () {
  return {
    type: 'RESET_USER_STATE'
  };
}

export function logoutUser () {
  return (dispatch) => {
    window.localStorage.removeItem('errsole-jwt-token');
    const { protocol, hostname, port, pathname } = window.location;
    const path = `${protocol}//${hostname}${port ? ':' + port : ''}${pathname}`;
    dispatch(resetUserProfileState());
    window.location.href = path + '#/login';
  };
}

// Save token to localStorage
function saveToken (token) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem('errsole-jwt-token', token);
  }
}

export function addUser (userData, callback) {
  return (dispatch) => {
    http.addUser(userData)
      .then((response) => {
        const userDetails = response.data.data;
        callback(null, userDetails);
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

export function removeUser (userId, callback) {
  return (dispatch) => {
    http.removeUser(userId)
      .then((response) => {
        const result = response.data.data;
        callback(null, result);
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
