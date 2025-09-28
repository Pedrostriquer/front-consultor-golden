import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import consultantService from '../../dbServices/consultantService';
import useDebounce from '../../hooks/useDebounce';
import TableFilters from '../TableFilters/TableFilters';
import './Vendas.css';
import goldenLogo from '../../img/logo-golden-ouro2.png';
import diamondLogo from '../../img/diamond_prime_diamond (1).png';

// Funções Auxiliares
const formatCurrency = (value) => {
  if (value === null || value === undefined) return "R$ 0,00";
  return `R$${value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const getStatusBadge = (status) => {
    const statusMap = {
      1: { text: "Pendente", className: "status-pending" },
      2: { text: "Valorizando", className: "status-active" },
      3: { text: "Cancelado", className: "status-canceled" },
      4: { text: "Concluído", className: "status-completed" }
    };
    const { text, className } = statusMap[status] || { text: "Desconhecido", className: ""};
    return <span className={`status-badge ${className}`}>{text}</span>;
};

const PlatformLogo = ({ platform }) => {
    const logo = platform === 'Golden Brasil' ? goldenLogo : diamondLogo;
    return <img src={logo} alt={platform} className="platform-logo" title={platform} />;
};

const EmptyState = ({ icon, title, message }) => (
    <tr>
      <td colSpan="6">
        <div className="empty-state">
          <div className="empty-state-icon"><i className={icon}></i></div>
          <h3 className="empty-state-title">{title}</h3>
          <p className="empty-state-message">{message}</p>
        </div>
      </td>
    </tr>
  );

// Componente Principal
const Vendas = () => {
  const [contracts, setContracts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: '',
    sortBy: 'dateCreated',
    sortOrder: 'desc',
    platform: 'all', // <-- NOVO ESTADO
  });

  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const debouncedFilters = useDebounce(filters, 500);

  const fetchContracts = useCallback(async () => {
    const pageSize = 10;
    const params = {
      ...debouncedFilters,
      searchTerm: debouncedSearchTerm,
      pageNumber: page,
      pageSize: pageSize,
    };
    const response = await consultantService.searchContracts(params);
    setContracts(response.data.items);
    setTotalPages(Math.ceil(response.data.totalCount / pageSize));
  }, [page, debouncedSearchTerm, debouncedFilters]);

  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  useEffect(() => { setPage(1); }, [debouncedSearchTerm, debouncedFilters]);

  const handleRowClick = (clientId, contractId) => {
    navigate(`/platform/vendas/cliente/${clientId}/contratos/${contractId}`);
  };

  const sortOptions = [
    { label: 'Data', value: 'dateCreated' },
    { label: 'Valor', value: 'amount' }
  ];
  
  const rowVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  };

  return (
    <div className="vendas-page">
      <div className="page-header">
        <h1>Vendas</h1>
        <div className="header-actions">
          <div className="search-bar">
            <i className="fa-solid fa-magnifying-glass"></i>
            <input 
              type="text" 
              placeholder="Buscar por cliente, ID do contrato..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <TableFilters 
        filters={filters} 
        setFilters={setFilters} 
        availableSorts={sortOptions} 
        showPlatformFilter={true} // <-- NOVA PROP
      />

      <div className="table-wrapper card-base">
        <table>
          <thead>
            <tr>
              <th>Plataforma</th>
              <th>ID Contrato</th>
              <th>Cliente</th>
              <th>Valor</th>
              <th>Status</th>
            </tr>
          </thead>
          <AnimatePresence>
            <tbody>
              {contracts.length > 0 ? (
                contracts.map(contract => (
                  <motion.tr 
                    key={contract.id} 
                    onClick={() => handleRowClick(contract.clientId, contract.id)}
                    variants={rowVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    layout
                  >
                    <td><PlatformLogo platform={contract.platform} /></td>
                    <td>#{contract.id}</td>
                    <td>{contract.clientName}</td>
                    <td>{formatCurrency(contract.amount)}</td>
                    <td>{getStatusBadge(contract.status)}</td>
                  </motion.tr>
                ))
              ) : (
                <EmptyState 
                  icon="fa-solid fa-file-invoice-dollar"
                  title="Nenhum contrato encontrado"
                  message={searchTerm || Object.values(filters).some(v => v)
                    ? "Sua busca e filtros não retornaram resultados."
                    : "Nenhum contrato para exibir."
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

export default Vendas;