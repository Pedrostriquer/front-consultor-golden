import api from './api/api';
import axios from 'axios';

// const MINERIOS_API_URL = "http://localhost:5097/api/Receipt";
const MINERIOS_API_URL = "https://backend.demelloagent.app/api/Receipt";


/**
 * Busca clientes com base em vários parâmetros.
 * @param {object} params - Os parâmetros de busca.
 * @returns {Promise<Array>} - Uma promessa que resolve para um array de clientes.
 */
const searchClients = async (params = {}) => {
  const {
    consultantId,
    name,
    cpfCnpj,
    platformId,
    sortBy = 'name',
    sortDirection = 'asc',
  } = params;

  // Constrói os parâmetros da query para o URL
  const queryParams = new URLSearchParams({
    consultantId,
    sortDirection,
  });

  // Adiciona parâmetros opcionais apenas se tiverem valor
  if (name) queryParams.append('name', name);
  if (cpfCnpj) queryParams.append('cpfCnpj', cpfCnpj);
  if (platformId) queryParams.append('platformId', platformId);
  if (sortBy) queryParams.append('sortBy', sortBy);

  try {
    const response = await api.get(`Client/search2?${queryParams.toString()}`);
    // A nova API retorna diretamente um array de clientes.
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
 * Envia um recibo DIRETAMENTE para o backend de Contratos de Minérios.
 */
const addContractReceiptMineriosDirect = async (clientCpfCnpj, contractId, description, file) => {
  const formData = new FormData();
  formData.append("clientCpfCnpj", clientCpfCnpj);
  formData.append("contractId", contractId);
  formData.append("description", description);
  formData.append("file", file);

  // Requisição direta para o localhost:5097
  const response = await axios.post(
    `${MINERIOS_API_URL}/contract-consultor-adding`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return response.data;
};
const clientService = {
  searchClients,
  getClientDetails, // Renomeado e atualizado
  addContractReceiptMineriosDirect
};

export default clientService;