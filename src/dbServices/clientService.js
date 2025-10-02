import api from './api/api';

/**
 * Busca uma lista paginada de clientes com base em vários parâmetros.
 * @param {object} params - Os parâmetros de busca.
 * @returns {Promise<object>} - Uma promessa que resolve para um objeto com os itens e a contagem total.
 */
const searchClients = async (params = {}) => {
  const {
    searchTerm = '',
    pageNumber = 1,
    pageSize = 10,
    sortBy = 'name',
    sortOrder = 'asc',
    consultantId
  } = params;

  // Constrói os parâmetros da query para o URL
  const queryParams = new URLSearchParams({
    name: searchTerm,
    offset: (pageNumber - 1) * pageSize,
    limit: pageSize,
    order: sortOrder,
  });

  // Adiciona o ID do consultor à query apenas se ele for fornecido
  if (consultantId) {
    queryParams.append('consultantId', consultantId);
  }

  try {
    const response = await api.get(`Client/search?${queryParams.toString()}`);
    // Retorna os dados no formato que a nossa aplicação espera (com items e totalCount)
    return {
      items: response.data,
      totalCount: response.headers['x-total-count'] || response.data.length,
    };
  } catch (error) {
    console.error("Erro ao buscar a lista de clientes:", error);
    throw error;
  }
};

/**
 * Busca os detalhes de um único cliente usando o seu CPF/CNPJ.
 * @param {string} cpfCnpj - O CPF ou CNPJ do cliente a ser buscado.
 * @returns {Promise<object>} - Uma promessa que resolve para o objeto do cliente.
 */
const getClientByCpfCnpj = async (cpfCnpj) => {
    try {
        const queryParams = new URLSearchParams({ cpfCnpj });
        const response = await api.get(`Client/search?${queryParams.toString()}`);
        
        // A API de busca retorna uma lista, então precisamos de pegar o primeiro (e único) resultado
        if (response.data && response.data.length > 0) {
            return response.data[0];
        } else {
            // Se a lista estiver vazia, o cliente não foi encontrado.
            throw new Error("Cliente não encontrado");
        }
    } catch (error) {
        console.error(`Erro ao buscar cliente com CPF/CNPJ ${cpfCnpj}:`, error);
        throw error;
    }
}

// Exporta um objeto com todos os métodos do serviço de cliente
const clientService = {
  searchClients,
  getClientByCpfCnpj,
};

export default clientService;