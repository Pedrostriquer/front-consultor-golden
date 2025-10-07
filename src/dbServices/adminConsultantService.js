import api from './api/api';

const API_KEY = 'c7a3c3e5-8d2a-4f5a-8b1e-9c0d1e2f3a4b';
const apiKeyHeaders = { 'X-API-Key': API_KEY };

/**
 * Busca uma lista paginada de consultores (usa o token Bearer do login).
 */
const searchConsultants = async ({ offset = 0, limit = 10, name = '' }) => {
  try {
    const response = await api.get('consultant/search2', {
      params: { offset, limit, name: name || undefined }
    });
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar consultores:", error);
    throw error;
  }
};

/**
 * Busca os detalhes de um consultor específico pelo ID (usa X-API-Key).
 */
const getConsultantById = async (id) => {
  try {
    const response = await api.get(`Consultant/${id}`, { headers: apiKeyHeaders });
    return response.data;
  } catch (error) {
    console.error(`Erro ao buscar detalhes do consultor ${id}:`, error);
    throw error;
  }
};

/**
 * Busca as vendas de um consultor (usa X-API-Key).
 */
const getConsultantSales = async ({ consultantId, offset = 0, limit = 20 }) => {
    try {
        const response = await api.get('Sale/search', {
            params: { consultantId, offset, limit, order: 'date_desc' },
            headers: apiKeyHeaders
        });
        return response.data;
    } catch (error) {
        console.error(`Erro ao buscar vendas do consultor ${consultantId}:`, error);
        throw error;
    }
}

/**
 * Associa uma nova meta a um consultor.
 */
const associateMetaToConsultant = async (id, metaId) => {
    try {
        const response = await api.patch(`Consultant/${id}/meta`, { metaId }, { headers: apiKeyHeaders });
        return response.data;
    } catch (error) {
        console.error(`Erro ao associar meta para o consultor ${id}:`, error);
        throw error;
    }
}

// ======================= NOVA FUNÇÃO =======================
/**
 * Busca os clientes de um consultor (usa X-API-Key).
 * @param {object} params - Parâmetros como consultantId.
 */
const getConsultantClients = async ({ consultantId }) => {
    try {
        const response = await api.get('Client/search', {
            params: { consultantId },
            headers: apiKeyHeaders
        });
        return response.data;
    } catch (error) {
        console.error(`Erro ao buscar clientes do consultor ${consultantId}:`, error);
        throw error;
    }
}
// ==========================================================


const adminConsultantService = {
  searchConsultants,
  getConsultantById,
  getConsultantSales,
  associateMetaToConsultant,
  getConsultantClients, // Exporta a nova função
};

export default adminConsultantService;