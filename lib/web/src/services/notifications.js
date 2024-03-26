import { notification } from 'antd';

const Notifications = {};

function showNotifications (type = 'open', msg, duration = 7, description) {
  notification[type]({
    message: msg,
    description,
    duration
  });
}

Notifications.showErrors = function (error) {
  let title = '';
  let detail = '';
  if (error.response) {
    if (error.response.status === 401) {
      showNotifications('error', 'Unauthorized');
    } else if (error.response.data && error.response.data.errors) {
      title = error.response.data.errors[0].title;
      detail = error.response.data.errors[0].message;
      showNotifications('error', detail);
    } else {
      title = error.response.data.errors[0].title;
      detail = '';
      showNotifications('error', title);
    }
  } else {
    title = error.message;
    detail = '';
    if (title && title.toLowerCase() === 'network error') {
      title = 'Something went wrong. Please report the issue in Github';
    }
    showNotifications('error', title);
  }
};

export { Notifications };
