import React, { createContext, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. Importar o useNavigate

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate(); // 2. Inicializar o hook de navegação

  const [user] = useState({
    id: 1,
    name: 'Consultor Golden',
    email: 'consultor@goldenbrasil.com',
    cpfCnpj: '000.000.000-00',
    commissionPercentage: 10,
    balance: 12345.67,
  });

  // 3. Implementar a função de logout
  const logout = () => {
    // Em uma aplicação real, você limparia tokens e estado aqui
    console.log('Logging out...');
    navigate('/login');
  };

  const value = {
    user,
    isAuthenticated: true,
    isLoading: false,
    login: async () => {},
    logout, // Usar a nova função
    updateUserBalance: () => {},
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};