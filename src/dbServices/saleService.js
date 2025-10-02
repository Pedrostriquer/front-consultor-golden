import api from './api/api';

/**
 * Busca uma lista paginada de vendas com base em vários parâmetros.
 * @param {object} params - Os parâmetros de busca.
 * @returns {Promise<object>} - Uma promessa que resolve para um objeto com as vendas e a contagem total.
 */
const searchSales = async (params = {}) => {
  const {
    searchTerm = '',
    pageNumber = 1,
    pageSize = 10,
    sortBy = 'id',
    sortOrder = 'desc',
    consultantId,
    clientId, // Adicionado para buscar vendas de um cliente
    status = ''
  } = params;

  // Constrói os parâmetros da query para o URL
  const queryParams = new URLSearchParams({
    searchTerm,
    offset: (pageNumber - 1) * pageSize,
    limit: pageSize,
    order: sortOrder,
  });

  // Adiciona os IDs e status apenas se forem fornecidos
  if (consultantId) {
    queryParams.append('consultantId', consultantId);
  }
  if (clientId) {
    queryParams.append('clientId', clientId);
  }
  if (status && status !== 'ALL') {
    queryParams.append('status', status);
  }

  try {
    const response = await api.get(`Sale/search?${queryParams.toString()}`);
    // A API retorna um objeto { sales: [...], totalCount: X }
    return response.data || { sales: [], totalCount: 0 };
  } catch (error) {
    console.error("Erro ao buscar a lista de vendas:", error);
    throw error;
  }
};

/**
 * Busca os detalhes de uma única venda usando o seu ID.
 * @param {string} saleId - O ID da venda a ser buscada.
 * @returns {Promise<object>} - Uma promessa que resolve para o objeto da venda.
 */
const getSaleById = async (saleId) => {
  try {
    // Usa o endpoint GET /api/Sale/{id}
    const response = await api.get(`Sale/${saleId}`);
    return response.data;
  } catch (error) {
    console.error(`Erro ao buscar venda com ID ${saleId}:`, error);
    throw error;
  }
};


// Exporta um objeto com todos os métodos do serviço de vendas
const saleService = {
  searchSales,
  getSaleById,
};

export default saleService;