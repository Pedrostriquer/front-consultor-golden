import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_BASE_ROUTE,
});

api.interceptors.request.use(async config => {
  let token = localStorage.getItem('authToken');
  let tokenType = 'Consultor';

  if (!token) {
    token = localStorage.getItem('adminAuthToken');
    tokenType = 'Admin';
  }


  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
}, error => {
  return Promise.reject(error);
});

export default api;