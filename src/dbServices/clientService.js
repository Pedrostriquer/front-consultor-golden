import api from './api/api';

const searchClients = async (params = {}) => {
  const {
    consultantId,
    name,
    cpfCnpj,
    platformId,
    sortBy = 'name',
    sortDirection = 'asc',
    offset = 0, // Novo
    limit = 20  // Novo
  } = params;

  const queryParams = new URLSearchParams({
    consultantId,
    sortDirection,
    offset, // Repassa para o backend
    limit   // Repassa para o backend
  });

  if (name) queryParams.append('name', name);
  if (cpfCnpj) queryParams.append('cpfCnpj', cpfCnpj);
  if (platformId) queryParams.append('platformId', platformId);
  if (sortBy) queryParams.append('sortBy', sortBy);

  try {
    const response = await api.get(`Client/search2?${queryParams.toString()}`);
    return response.data || [];
  } catch (error) {
    console.error("Erro ao buscar a lista de clientes:", error);
    throw error;
  }
};

/**
 * Busca os detalhes completos de um cliente.
 * @param {number} platformId - O ID da plataforma do cliente.
 * @param {string} clientCpfCnpj - O CPF ou CNPJ do cliente.
 * @returns {Promise<object>} - Uma promessa que resolve para o objeto de dados completos do cliente.
 */
const getClientDetails = async (platformId, clientCpfCnpj) => {
    try {
        const queryParams = new URLSearchParams({ platformId, clientCpfCnpj });
        const response = await api.get(`Client/details?${queryParams.toString()}`);
        return response.data;
    } catch (error) {
        console.error(`Erro ao buscar detalhes do cliente com CPF/CNPJ ${clientCpfCnpj}:`, error);
        throw error;
    }
}

/**
 * Envia um recibo para o backend de Contratos de Minérios através do
 * backend de consultores (proxy autenticado com o token do consultor).
 */
const addContractReceiptMinerios = async (clientCpfCnpj, contractId, description, file) => {
  const formData = new FormData();
  formData.append("clientCpfCnpj", clientCpfCnpj);
  formData.append("contractId", contractId);
  formData.append("description", description);
  formData.append("file", file);

  // O axios define o Content-Type multipart (com boundary) automaticamente
  const response = await api.post("Receipt/contract-consultor-adding", formData);
  return response.data;
};
const clientService = {
  searchClients,
  getClientDetails, // Renomeado e atualizado
  addContractReceiptMinerios
};

export default clientService;