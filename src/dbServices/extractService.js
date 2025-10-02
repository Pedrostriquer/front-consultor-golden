import api from './api/api';

/**
 * Busca o extrato paginado do consultor.
 * @param {number} page - O número da página a ser buscada.
 * @param {number} pageSize - A quantidade de itens por página.
 * @returns {Promise<object>} - Uma promessa que resolve para um objeto com os itens do extrato e a contagem total.
 */
const getConsultantExtract = async (page = 1, pageSize = 5) => {
  try {
    const queryParams = new URLSearchParams({
      page,
      pageSize,
    });
    const response = await api.get(`consultant-extract?${queryParams.toString()}`);
    // A API retorna um objeto { items: [...], totalCount: X }
    return response.data || { items: [], totalCount: 0 };
  } catch (error) {
    console.error("Erro ao buscar o extrato do consultor:", error);
    throw error;
  }
};

const extractService = {
  getConsultantExtract,
};

export default extractService;