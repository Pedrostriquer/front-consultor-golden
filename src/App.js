import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './Context/AuthContext';

// Importação dos componentes de página
import Platform from './components/Platform/Platform';
import Login from './components/Login/Login';
import Home from './components/Home/Home';
import Clientes from './components/Clientes/Clientes';
import ClientDetailPage from './components/Clientes/ClientDetailPage/ClientDetailPage';
import Vendas from './components/Vendas/Vendas';
import ContractDetailPage from './components/Clientes/ClientDetailPage/ContractDetailPage/ContractDetailPage';
import Saque from './components/Saque/Saque';
import Extrato from './components/Extrato/Extrato';
import Perfil from './components/Perfil/Perfil';

// Componente de Rota Privada
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return null; 
  }
  return isAuthenticated ? children : <Navigate to="/login" />;
};


function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route 
        path="/platform/*" 
        element={
          <PrivateRoute>
            <Platform />
          </PrivateRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" />} />
        <Route path="dashboard" element={<Home />} />
        <Route path="clientes" element={<Clientes />} />
        <Route path="clientes/:cpfCnpj" element={<ClientDetailPage />} />
        
        {/* ROTA ATUALIZADA para detalhes da VENDA */}
        <Route
          path="vendas/:saleId/detalhes"
          element={<ContractDetailPage />}
        />
        
        {/* ROTA ADICIONAL para detalhes do CONTRATO (vindo da pág. do cliente) */}
        <Route
          path="contratos/:contractId/detalhes"
          element={<ContractDetailPage />}
        />

        <Route path="vendas" element={<Vendas />} />
        {/* <Route path="saque" element={<Saque />} /> */}
        <Route path="extrato" element={<Extrato />} />
        <Route path="perfil" element={<Perfil />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;