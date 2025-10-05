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
import SaleDetailPage from './components/Vendas/SaleDetailPage'; // <-- NOVA IMPORTAÇÃO
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
        path="/platform" 
        element={
          <PrivateRoute>
            <Platform />
          </PrivateRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Home />} />
        <Route path="clientes" element={<Clientes />} />
        <Route path="clientes/:cpfCnpj" element={<ClientDetailPage />} />
        <Route path="contrato/:contractId" element={<ContractDetailPage />} />
        <Route path="vendas" element={<Vendas />} />
        <Route path="vendas/:saleId" element={<SaleDetailPage />} /> {/* <-- NOVA ROTA */}
        <Route path="extrato" element={<Extrato />} />
        <Route path="perfil" element={<Perfil />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;