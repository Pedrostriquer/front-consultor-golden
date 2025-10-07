import api from './api/api';

const API_KEY = 'c7a3c3e5-8d2a-4f5a-8b1e-9c0d1e2f3a4b';
const headers = { 'X-API-Key': API_KEY };

/**
 * Busca todas as metas.
 */
const getMetas = async () => {
  try {
    const response = await api.get('Meta', { headers });
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar metas:", error);
    throw error;
  }
};

/**
 * Cria uma nova meta.
 * @param {object} metaData - Os dados da nova meta.
 */
const createMeta = async (metaData) => {
  try {
    const response = await api.post('Meta', metaData, { headers });
    return response.data;
  } catch (error) {
    console.error("Erro ao criar meta:", error);
    throw error;
  }
};

/**
 * Atualiza uma meta existente.
 * @param {number} id - O ID da meta a ser atualizada.
 * @param {object} metaData - Os novos dados da meta.
 */
const updateMeta = async (id, metaData) => {
    try {
      // A API pode esperar o objeto completo, então garantimos que o ID está no corpo
      const payload = { ...metaData, id };
      const response = await api.put(`Meta/${id}`, payload, { headers });
      return response.data;
    } catch (error) {
      console.error(`Erro ao atualizar meta ${id}:`, error);
      throw error;
    }
  };

/**
 * Deleta uma meta.
 * @param {number} id - O ID da meta a ser deletada.
 */
const deleteMeta = async (id) => {
  try {
    await api.delete(`Meta/${id}`, { headers });
  } catch (error) {
    console.error(`Erro ao deletar meta ${id}:`, error);
    throw error;
  }
};


const adminMetaService = {
  getMetas,
  createMeta,
  updateMeta,
  deleteMeta,
};

export default adminMetaService;