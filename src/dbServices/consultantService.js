import api from './api/api';
// Não precisamos mais do mockData aqui

/**
 * Busca os dados do consultor atualmente autenticado.
 */
const getMe = async () => {
  try {
    const response = await api.get('consultant/me');
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar os dados do consultor logado:", error);
    throw error;
  }
};

/**
 * Busca os dados para a página Home (Dashboard) da API real.
 */
const getDashboardData = async () => {
    try {
        const response = await api.get('ConsultantDashboard');
        return response.data;
    } catch (error) {
        console.error("Erro ao buscar dados da dashboard:", error);
        throw error;
    }
};


const consultantService = {
  getMe,
  getDashboardData,
};

export default consultantService;