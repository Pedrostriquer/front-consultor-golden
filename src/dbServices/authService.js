import api from './api/api';

/**
 * Realiza o login do consultor.
 * @param {string} cpfCnpj - O CPF/CNPJ do consultor.
 * @param {string} password - A senha do consultor.
 * @returns {Promise<object>} - A promessa que resolve para os dados de autenticação.
 */
const login = async (cpfCnpj, password) => {
    try {
        const response = await api.post('auth/login', {
            cpfCnpj,
            password,
        });

        if (response.data && response.data.accessToken) {
            // Limpa tokens antigos de admin para evitar conflitos de permissão
            localStorage.removeItem('adminAuthToken');
            localStorage.removeItem('adminRefreshToken');

            // Salva os novos tokens do consultor
            localStorage.setItem('authToken', response.data.accessToken);
            localStorage.setItem('refreshToken', response.data.refreshToken);
        }

        return response.data;
    } catch (error) {
        console.error("Erro no login do consultor:", error);
        throw error;
    }
};

/**
 * Realiza o logout do consultor, removendo seus tokens.
 */
const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
};

const authService = {
    login,
    logout,
};

export default authService;