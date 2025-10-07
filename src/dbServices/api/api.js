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

  // Adicione este log para depuração
  console.log(`Enviando requisição para ${config.url} com token do tipo: ${tokenType}`);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
}, error => {
  return Promise.reject(error);
});

export default api;