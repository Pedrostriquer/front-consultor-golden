import api from './api/api';

/**
 * Busca uma lista paginada de vendas com base em vários parâmetros da API.
 * @param {object} params - Os parâmetros de busca.
 * @returns {Promise<object>} - Uma promessa que resolve para um objeto com as vendas e a contagem total.
 */
const searchSales = async (params = {}) => {
  const {
    searchTerm = '',
    consultantId,
    status,
    month,
    year,
    pageNumber = 1,
    pageSize = 10,
    order = 'date_desc', // Padrão da API
  } = params;

  // Constrói os parâmetros da query para o URL
  const queryParams = new URLSearchParams({
    offset: (pageNumber - 1) * pageSize,
    limit: pageSize,
    order,
  });

  // Adiciona os parâmetros apenas se eles tiverem um valor válido
  if (consultantId) queryParams.append('consultantId', consultantId);
  if (searchTerm) queryParams.append('searchTerm', searchTerm);
  if (status && status !== 'ALL') queryParams.append('status', status);
  if (month && month !== 'ALL') queryParams.append('month', month);
  if (year && year !== 'ALL') queryParams.append('year', year);


  try {
    const response = await api.get(`sale/search?${queryParams.toString()}`);
    // A API retorna um objeto { sales: [...], totalCount: X }
    return response.data || { sales: [], totalCount: 0 };
  } catch (error) {
    console.error("Erro ao buscar a lista de vendas:", error);
    throw error;
  }
};

/**
 * Busca os detalhes de uma única venda usando o seu ID.
 * @param {number} saleId - O ID da venda a ser buscada.
 * @returns {Promise<object>} - Uma promessa que resolve para o objeto da venda.
 */
const getSaleById = async (saleId) => {
  try {
    const response = await api.get(`sale/${saleId}`);
    return response.data;
  } catch (error) {
    console.error(`Erro ao buscar venda com ID ${saleId}:`, error);
    throw error;
  }
};


const saleService = {
  searchSales,
  getSaleById,
};

export default saleService;