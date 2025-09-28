import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Importando os componentes da plataforma
import Platform from './components/Platform/Platform';
import Home from './components/Home/Home';
import Clientes from './components/Clientes/Clientes';
import Vendas from './components/Vendas/Vendas';
import ClientDetailPage from './components/Clientes/ClientDetailPage/ClientDetailPage';
import ContractDetailPage from './components/Clientes/ClientDetailPage/ContractDetailPage/ContractDetailPage';
import Saque from './components/Saque/Saque';
import Extrato from './components/Extrato/Extrato';
import Perfil from './components/Perfil/Perfil';
import Login from './components/Login/Login';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route path="/platform" element={<Platform />}>
        <Route index element={<Navigate to="dashboard" />} />
        <Route path="dashboard" element={<Home />} />
        <Route path="clientes" element={<Clientes />} />
        <Route path="clientes/:clientId" element={<ClientDetailPage />} />
        <Route
          path="clientes/:clientId/contratos/:contractId"
          element={<ContractDetailPage />}
        />
        <Route path="vendas" element={<Vendas />} />
        {/* Nova rota para detalhes do contrato vindo de Vendas */}
        <Route 
          path="vendas/cliente/:clientId/contratos/:contractId" 
          element={<ContractDetailPage />} 
        />
        <Route path="saque" element={<Saque />} />
        <Route path="extrato" element={<Extrato />} />
        <Route path="perfil" element={<Perfil />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;