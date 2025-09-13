import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import consultantService from '../../dbServices/consultantService';
import useDebounce from '../../hooks/useDebounce';
import './Clientes.css';

// Função auxiliar para formatação de moeda
const formatCurrency = (value) => {
  if (value === null || value === undefined) return "R$ 0,00";
  return `R$${value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// --- Componentes Locais para UI ---

// Componente para o estado de "Nenhum resultado"
const EmptyState = ({ icon, title, message }) => (
  <tr>
    <td colSpan="5">
      <div className="empty-state">
        <div className="empty-state-icon"><i className={icon}></i></div>
        <h3 className="empty-state-title">{title}</h3>
        <p className="empty-state-message">{message}</p>
      </div>
    </td>
  </tr>
);


// --- Componente Principal da Página ---

const Clientes = () => {
  const [clients, setClients] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // O estado de isLoading foi removido, pois o loader agora é global
  const fetchClients = useCallback(async (currentPage, search) => {
    try {
      const response = await consultantService.searchMyClients(search, currentPage, 10);
      const { items, totalCount, pageSize } = response.data;
      setClients(items);
      setTotalPages(Math.ceil(totalCount / pageSize));
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
      setClients([]);
    }
  }, []);

  useEffect(() => {
    fetchClients(page, debouncedSearchTerm);
  }, [page, debouncedSearchTerm, fetchClients]);

  useEffect(() => { setPage(1); }, [debouncedSearchTerm]);

  const handleRowClick = (clientId) => {
    navigate(`/platform/clientes/${clientId}`);
  };
  
  const rowVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  };

  return (
    <div className="clientes-page">
      <div className="page-header">
        <h1>Meus Clientes</h1>
        <div className="header-actions">
          <div className="search-bar">
            <i className="fa-solid fa-magnifying-glass"></i>
            <input 
              type="text" 
              placeholder="Buscar por nome, CPF, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="table-wrapper card-base">
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>CPF/CNPJ</th>
              <th>Email</th>
              <th>Celular</th>
              <th>Saldo em Contratos</th>
            </tr>
          </thead>
          <AnimatePresence>
            <tbody>
              {clients.length > 0 ? (
                clients.map(client => (
                  <motion.tr 
                    key={client.id} 
                    onClick={() => handleRowClick(client.id)}
                    variants={rowVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    layout
                  >
                    <td>{client.name}</td>
                    <td>{client.cpfCnpj}</td>
                    <td>{client.email}</td>
                    <td>{client.phoneNumber}</td>
                    <td className="saldo-positivo">{formatCurrency(client.balance)}</td>
                  </motion.tr>
                ))
              ) : (
                <EmptyState 
                  icon="fa-solid fa-users-slash"
                  title="Nenhum cliente encontrado"
                  message={searchTerm 
                    ? `Sua busca por "${searchTerm}" não retornou resultados.`
                    : "Você ainda não possui clientes cadastrados."
                  }
                />
              )}
            </tbody>
          </AnimatePresence>
        </table>
      </div>
      
      {totalPages > 1 && (
        <div className="pagination-controls">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
            <i className="fa-solid fa-chevron-left"></i> Anterior
          </button>
          <span>Página {page} de {totalPages || 1}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages || totalPages === 0}>
            Próxima <i className="fa-solid fa-chevron-right"></i>
          </button>
        </div>
      )}
    </div>
  );
};

export default Clientes;