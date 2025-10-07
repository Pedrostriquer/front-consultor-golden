import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './Context/AuthContext';

// --- (Importações do Consultor) ---
import Platform from './components/Platform/Platform';
import Login from './components/Login/Login';
import Home from './components/Home/Home';
import Clientes from './components/Clientes/Clientes';
import ClientDetailPage from './components/Clientes/ClientDetailPage/ClientDetailPage';
import Vendas from './components/Vendas/Vendas';
import ContractDetailPage from './components/Clientes/ClientDetailPage/ContractDetailPage/ContractDetailPage';
import SaleDetailPage from './components/Vendas/SaleDetailPage';
import Extrato from './components/Extrato/Extrato';
import Perfil from './components/Perfil/Perfil';

// --- IMPORTAÇÕES DO ADMIN ---
import AdminLogin from './components/Admin/AdminLogin/AdminLogin';
import AdminLayout from './components/Admin/AdminLayout/AdminLayout'; // NOVO LAYOUT
import AdminDashboard from './components/Admin/AdminDashboard/AdminDashboard'; // NOVA DASHBOARD
import AdminConsultantList from './components/Admin/AdminConsultantList/AdminConsultantList'; // LISTA RENOMEADA
import ConsultantDetailPage from './components/Admin/ConsultantDetailPage/ConsultantDetailPage';

// Componente de Rota Privada do Consultor
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Componente de Rota Privada do Admin (simples verificação de token)
const AdminPrivateRoute = ({ children }) => {
    const hasToken = !!localStorage.getItem('adminAuthToken');
    return hasToken ? children : <Navigate to="/admin/login" />;
};


function App() {
  return (
    <Routes>
      {/* --- ROTA DE LOGIN DO CONSULTOR --- */}
      <Route path="/login" element={<Login />} />
      
      {/* --- ROTA DE LOGIN DO ADMIN --- */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* --- ROTAS PRIVADAS DO ADMIN --- */}
      <Route 
        path="/admin" 
        element={
          <AdminPrivateRoute>
            <AdminLayout />
          </AdminPrivateRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="consultores" element={<AdminConsultantList />} />
        <Route path="consultor/:consultantId" element={<ConsultantDetailPage />} />
      </Route>

      {/* --- ROTAS PRIVADAS DO CONSULTOR --- */}
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
        <Route path="vendas/:saleId" element={<SaleDetailPage />} />
        <Route path="extrato" element={<Extrato />} />
        <Route path="perfil" element={<Perfil />} />
      </Route>

      {/* Rota padrão */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;