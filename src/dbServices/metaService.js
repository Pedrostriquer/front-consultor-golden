import api from './api/api';

/**
 * Busca os dados de metas da API.
 * @returns {Promise<object>} - Uma promessa que resolve para os dados de metas.
 */
const getMetas = async () => {
  try {
    // Adiciona o cabeçalho X-API-Key especificamente para esta requisição
    const response = await api.get('Meta', {
      headers: {
        'X-API-Key': 'c7a3c3e5-8d2a-4f5a-8b1e-9c0d1e2f3a4b'
      }
    });

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