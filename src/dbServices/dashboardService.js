import api from './api/api';

/**
 * Envia uma requisição para o backend para iniciar a geração
 * dos dados do dashboard em segundo plano.
 */
const startDataGeneration = async () => {
  try {
    // A rota é 'api/ConsultantDashboard/start-data-generation'
    // O axios já adiciona 'api/' no baseURL
    const response = await api.post('ConsultantDashboard/start-data-generation');
    console.log("Requisição para iniciar dados do dashboard enviada:", response.data.message);
    return response.data;
  } catch (error) {
    console.error("Erro ao solicitar a geração de dados do dashboard:", error);
    throw error;
  }
};

const dashboardService = {
  startDataGeneration,
};

export default dashboardService;