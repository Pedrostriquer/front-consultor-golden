import api from './api/api';

const login = async (email, password) => {
  try {
    const response = await api.post('auth/admin/login', {
      email,
      password,
    });
    
    if (response.data && response.data.accessToken) {
      // --- ADICIONE ESTA PARTE ---
      // Limpa tokens antigos de consultor para evitar conflitos
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      // --- FIM DA ADIÇÃO ---

      localStorage.setItem('adminAuthToken', response.data.accessToken);
      localStorage.setItem('adminRefreshToken', response.data.refreshToken);
    }
    
    return response.data;
  } catch (error) {
    console.error("Erro no login do administrador:", error);
    throw error;
  }
};

const logout = () => {
  localStorage.removeItem('adminAuthToken');
  localStorage.removeItem('adminRefreshToken');
};

const adminAuthService = {
  login,
  logout,
};

export default adminAuthService;