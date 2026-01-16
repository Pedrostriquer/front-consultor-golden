import React, { createContext, useState, useContext, useEffect, useCallback } from 'react'; // Adicionado useCallback
import { useNavigate } from 'react-router-dom';
import authService from '../dbServices/authService';
import consultantService from '../dbServices/consultantService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // 1. Envolver o logout em useCallback para ser usado como dependência
  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('authToken');
    navigate('/login');
  }, [navigate]);

  // 2. Envolver fetchConsultantData em useCallback
  const fetchConsultantData = useCallback(async () => {
    try {
      const data = await consultantService.getMe();
      setUser(data); 
    } catch (error) {
      console.error("Falha ao buscar dados do consultor:", error);
      logout();
    }
  }, [logout]);

  // 3. Adicionar fetchConsultantData às dependências do useEffect
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      fetchConsultantData().finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [fetchConsultantData]); // <--- fetchConsultantData adicionada aqui

  const login = async (username, password) => {
    try {
      const data = await authService.login(username, password);
      localStorage.setItem('authToken', data.accessToken);
      await fetchConsultantData();
    } catch (error) {
      console.error('Falha no login:', error);
      throw error;
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
  };

  if (isLoading) {
    return <div>A carregar aplicação...</div>;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};