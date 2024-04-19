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

http.register = (userData) => {
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

http.getAllUsers = async () => {
  const response = await axios.get(`${endPoints.base}/users/all-users`);
  return response;
};

http.addUser = (userData) => {
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

http.getNumberOfUsers = () => {
  return axios.get(`${endPoints.base}/users/total-users`);
};

http.getConsoleLogs = (query) => {
  const queryRequest = makeQueryRequest(query);
  return axios.get(`${endPoints.base}/logs${queryRequest}`);
};

http.checkUpdates = () => {
  return axios.get(`${endPoints.base}/apps/check-updates`);
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
