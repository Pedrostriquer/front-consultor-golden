import api from './api/api';

/**
 * Busca os dados de metas da API.
 * @returns {Promise<object>} - Uma promessa que resolve para os dados de metas.
 */
const getMetas = async () => {
  try {
    const response = await api.get('Meta');
    // A API retorna uma lista, então pegamos o primeiro (e único) item.
    if (response.data && response.data.length > 0) {
      return response.data[0];
    }
    return null; // Retorna nulo se não houver metas
  } catch (error) {
    console.error("Erro ao buscar metas:", error);
    throw error;
  }
};

const metaService = {
  getMetas,
};

export default metaService;