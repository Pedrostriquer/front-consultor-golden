import api from './api/api';

const login = async (email, password) => {
  try {
    // CORRIGIDO: A rota foi ajustada para "auth/login"
    const response = await api.post('auth/login', {
      email: email,
      password: password,
    });
    
    return response.data;
  } catch (error) {
    throw error;
  }
};

const authService = {
  login,
};

export default authService;