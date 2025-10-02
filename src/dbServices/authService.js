import api from './api/api';

const login = async (username, password) => {
  try {
    // CORRIGIDO: Rota sem a barra inicial e corpo do pedido com "email"
    const response = await api.post('Auth/login/consultor', {
      email: username,    // Campo alterado para "email"
      password: password,   // Campo mantido como "password"
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