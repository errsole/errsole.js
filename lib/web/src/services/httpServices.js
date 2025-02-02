'use strict';

import axios from 'axios';

// Dynamically set the base URI, ignoring the hash part
const getBaseUri = () => {
  const { protocol, hostname, port, pathname } = window.location;
  return `${protocol}//${hostname}${port ? ':' + port : ''}${pathname}`;
};

const URI = getBaseUri(); // Use the dynamic base URI

// Set axios defaults
axios.defaults.baseURL = URI;
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
axios.defaults.headers.patch['Content-Type'] = 'application/x-www-form-urlencoded';
axios.defaults.withCredentials = true;

// Setup Axios interceptors to attach the JWT
axios.interceptors.request.use(config => {
  const token = getToken(); // Retrieve the stored token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`; // Attach the token to the header
  }
  return config;
}, error => {
  return Promise.reject(error);
});

const endPoints = {
  base: '/api'
};

// json format
const JSONAPIFormat = {
  data: {
    type: '',
    attributes: {}
  }
};

const format = (data, type) => {
  const obj = Object.assign({}, JSONAPIFormat);
  obj.data.type = type || '';
  obj.data.attributes = data;
  return obj;
};

const http = {};

http.register = async (userData) => {
  const data = format(userData, 'users');
  return axios.post(`${endPoints.base}/users/register`, data);
};

http.login = async (userData) => {
  const data = format(userData, 'users');
  const response = await axios.post(`${endPoints.base}/users/login`, data);
  return response;
};

http.getUserProfile = async () => {
  const response = await axios.get(`${endPoints.base}/users`);
  return response;
};

// Add the deleteAllLogs method here
http.deleteAllLogs = async () => {
  const response = await axios.delete(`${endPoints.base}/logs`);
  return response;
};

http.getAllUsers = async () => {
  const response = await axios.get(`${endPoints.base}/users/all-users`);
  return response;
};

http.addUser = async (userData) => {
  const data = format(userData, 'users');
  return axios.post(`${endPoints.base}/users`, data);
};

http.removeUser = async (userId) => {
  const response = await axios.delete(`${endPoints.base}/users/` + userId);
  return response;
};

http.updateProfile = async (data) => {
  data = format(data, 'users');
  const response = await axios.patch(`${endPoints.base}/users/update-profile`, data);
  return response;
};

http.updatePassword = async (data) => {
  data = format(data, 'users');
  const response = await axios.patch(`${endPoints.base}/users/update-password`, data);
  return response;
};

http.getNumberOfUsers = async () => {
  return axios.get(`${endPoints.base}/users/total-users`);
};

http.getConsoleLogs = async (query) => {
  const queryRequest = makeQueryRequest(query);
  return axios.get(`${endPoints.base}/logs${queryRequest}`);
};

http.checkUpdates = async () => {
  return axios.get(`${endPoints.base}/apps/check-updates`);
};

http.getSlackDetails = async () => {
  return axios.get(`${endPoints.base}/apps/integrations/slack`);
};

http.addSlackDetails = async (slackData) => {
  const data = format(slackData, 'apps');
  return axios.post(`${endPoints.base}/apps/integrations/slack`, data);
};

http.updateSlackDetails = async (slackData) => {
  const data = format(slackData, 'apps');
  return axios.patch(`${endPoints.base}/apps/integrations/slack`, data);
};

http.deleteSlackDetails = async () => {
  return axios.delete(`${endPoints.base}/apps/integrations/slack`);
};

http.getEmailDetails = async () => {
  return axios.get(`${endPoints.base}/apps/integrations/email`);
};

http.addEmailDetails = async (emailData) => {
  const data = format(emailData, 'apps');
  return axios.post(`${endPoints.base}/apps/integrations/email`, data);
};

http.updateEmailDetails = async (emailData) => {
  const data = format(emailData, 'apps');
  return axios.patch(`${endPoints.base}/apps/integrations/email`, data);
};

http.deleteEmailDetails = async () => {
  return axios.delete(`${endPoints.base}/apps/integrations/email`);
};

http.getLogsTTL = async () => {
  return axios.get(`${endPoints.base}/logs/config/ttl`);
};

http.updateLogsTTL = async (ttlData) => {
  const data = format(ttlData, 'apps');
  return axios.patch(`${endPoints.base}/logs/config/ttl`, data);
};

http.getLogMeta = async (logId) => {
  return axios.get(`${endPoints.base}/logs/` + logId + '/meta');
};

http.getHostnames = async () => {
  return axios.get(`${endPoints.base}/logs/hostnames`);
};

http.testSlackNotification = async () => {
  return axios.post(`${endPoints.base}/apps/integrations/slack/test`);
};

http.testEmailNotification = async () => {
  return axios.post(`${endPoints.base}/apps/integrations/email/test`);
};

http.getAlertUrl = async () => {
  return axios.get(`${endPoints.base}/apps/integrations/alert-url`);
};

http.addAlertUrl = async (urlData) => {
  const data = format(urlData, 'apps');
  return axios.post(`${endPoints.base}/apps/integrations/alert-url`, data);
};

function makeQueryRequest (query) {
  if (query && Object.keys(query).length !== 0) {
    const queryRequest = Object.keys(query).map(key => `${encodeURIComponent(key)}=${encodeURIComponent(query[key])}`).join('&');
    return `?${queryRequest}`;
  } else {
    return '';
  }
}

// Retrieve token from localStorage
function getToken () {
  if (typeof window !== 'undefined') {
    return window.localStorage.getItem('errsole-jwt-token');
  }
  return null;
}

export { http };
