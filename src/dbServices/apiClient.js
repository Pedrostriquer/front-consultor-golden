import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_BASE_ROUTE,
});

apiClient.interceptors.request.use((config) => {
  // CORRIGIDO: busca no localStorage E sessionStorage
  const token = localStorage.getItem("authTokenConsultor") || sessionStorage.getItem("authTokenConsultor");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default apiClient;