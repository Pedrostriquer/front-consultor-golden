import apiClient from './apiClient';

const searchMyClients = (searchTerm = '', pageNumber = 1, pageSize = 10) => {
    return apiClient.get('consultant/my-clients', { params: { searchTerm, pageNumber, pageSize } });
};

const getMyClientById = (clientId) => {
    return apiClient.get(`consultant/my-clients/${clientId}`);
};

const getMe = () => {
    return apiClient.get('consultant/me');
};

const createWithdraw = (withdrawData) => {
    return apiClient.post('consultantwithdraw', withdrawData);
};

const sendWithdrawVerificationCode = () => {
    return apiClient.post('consultantwithdraw/send-verification-code');
};

const getMyWithdraws = (params) => {
    return apiClient.get('consultantwithdraw/my-withdraws', { params });
};

const getConsultantExtract = (params) => {
    return apiClient.get('consultantextract', { params });
};

const getIndicationDetails = (indicationId) => {
    // Supondo que você tenha um endpoint para isso. Se não, precisará criar.
    // Ex: GET /api/consultantindication/{id}
    return apiClient.get(`consultantindication/${indicationId}`);
};

const getWithdrawDetails = (withdrawId) => {
    // Reutilizando o endpoint que já busca um saque por ID
    return apiClient.get(`consultantwithdraw/${withdrawId}`);
};

const getClientContracts = (clientId) => {
    return apiClient.get(`consultant/my-clients/${clientId}/contracts`);
};

const getContractDetails = (clientId, contractId) => {
    return apiClient.get(`consultant/my-clients/${clientId}/contracts/${contractId}`);
};

const getClientWithdraws = (clientId) => {
    return apiClient.get(`withdraw/client/${clientId}`);
};

const getDashboardData = () => {
    return apiClient.get('consultant/me/dashboard');
};

const consultantService = {
    searchMyClients,
    getMyClientById,
    getClientContracts,
    getContractDetails,
    getClientWithdraws,
    getDashboardData,
    getMe,
    createWithdraw,
    sendWithdrawVerificationCode,
    getMyWithdraws,
    getConsultantExtract,
    getIndicationDetails,
    getWithdrawDetails,
};

export default consultantService;