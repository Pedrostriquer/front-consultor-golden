import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../dbServices/authService';
import consultantService from '../dbServices/consultantService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const fetchConsultantData = async () => {
    try {
      const data = await consultantService.getMe();
      // CORREÇÃO: A API retorna o objeto do utilizador diretamente, não dentro de "consultor"
      setUser(data); 
    } catch (error) {
      console.error("Falha ao buscar dados do consultor:", error);
      logout();
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      fetchConsultantData().finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (username, password) => {
    try {
      const data = await authService.login(username, password);
      localStorage.setItem('authToken', data.accessToken);
      await fetchConsultantData();
      // A navegação agora é tratada pelo useEffect no Login.js, o que é mais robusto
    } catch (error) {
      console.error('Falha no login:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('authToken');
    navigate('/login');
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