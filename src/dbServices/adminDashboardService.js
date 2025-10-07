import api from './api/api';

/**
 * Busca os dados de métricas para o dashboard do admin.
 * @param {string} [platformId] - Opcional. Filtra os dados por plataforma.
 * @returns {Promise<object>} - Uma promessa que resolve para os dados da dashboard.
 */
const getDashboardMetrics = async (platformId) => {
  try {
    const response = await api.get('Sale/dashboard-metrics', {
      params: {
        platformId: platformId || undefined, // Envia o parâmetro apenas se definido
      }
    });
    return response.data;
  } catch (error)
 {
    console.error("Erro ao buscar métricas do dashboard do admin:", error);
    throw error;
  }
};

const adminDashboardService = {
  getDashboardMetrics,
};

export default adminDashboardService;