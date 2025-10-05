import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import saleService from '../../dbServices/saleService';
import { useAuth } from '../../Context/AuthContext';
import useDebounce from '../../hooks/useDebounce';
import './Vendas.css';

// --- Funções Auxiliares e Componentes de UI ---
const formatCurrency = (value) => `R$${(value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString("pt-BR", options);
};

const getStatusBadge = (status) => {
    const statusText = String(status).toUpperCase();
    const statusMap = {
      'PENDENTE': { text: "Pendente", className: "status-pending" },
      'VENDIDO': { text: "Vendido", className: "status-active" },
      'RECEBIDO': { text: "Recebido", className: "status-completed" },
      'CANCELADO': { text: "Cancelado", className: "status-canceled" },
    };
    const { text, className } = statusMap[statusText] || { text: statusText, className: "status-default"};
    return <span className={`status-badge ${className}`}>{text}</span>;
};

const EmptyState = ({ message }) => (
    <tr><td colSpan="5"><div className="empty-state">{message}</div></td></tr>
);

const TableSkeleton = () => (
    <tbody>
      {[...Array(10)].map((_, i) => (
        <tr key={i} className="skeleton-row">
          {[...Array(5)].map((_, j) => <td key={j}><div className="skeleton-bar"></div></td>)}
        </tr>
      ))}
    </tbody>
);

// --- Componente Principal ---
const Vendas = () => {
  const [sales, setSales] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'ALL',
    month: 'ALL',
    year: 'ALL',
    order: 'date_desc' // Padrão: mais recentes
  });

  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const debouncedFilters = useDebounce(filters, 300);

  const fetchSales = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    setError('');
    
    const params = {
      ...debouncedFilters,
      searchTerm: debouncedSearchTerm,
      pageNumber: page,
      pageSize: 10,
      consultantId: user.id,
    };

    try {
        const response = await saleService.searchSales(params);
        setSales(response.sales);
        setTotalPages(Math.ceil(response.totalCount / 10) || 1);
    } catch (err) {
        console.error("Erro ao buscar vendas:", err);
        setError("Não foi possível carregar as vendas. Tente novamente mais tarde.");
    } finally {
        setIsLoading(false);
    }
  }, [page, debouncedSearchTerm, debouncedFilters, user]);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  useEffect(() => { setPage(1); }, [debouncedSearchTerm, debouncedFilters]);

  const handleRowClick = (sale) => {
    // A navegação será para a página de detalhes da venda (a ser criada)
    // navigate(`/platform/vendas/${sale.id}/detalhes`);
    navigate(`/platform/vendas/${sale.id}`);
  };
  
  // Opções para os filtros de data
  const yearOptions = [new Date().getFullYear(), new Date().getFullYear() - 1, new Date().getFullYear() - 2];
  const monthOptions = Array.from({length: 12}, (_, i) => ({ value: i + 1, label: new Date(0, i).toLocaleString('pt-BR', { month: 'long' }) }));

  const rowVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <div className="vendas-page">
      <div className="page-header">
        <h1>Minhas Vendas</h1>
        <p>Acompanhe o histórico de todas as suas vendas realizadas.</p>
      </div>

      <div className="filters-container card-base">
          <div className="search-bar">
            <i className="fa-solid fa-magnifying-glass"></i>
            <input 
              type="text" 
              placeholder="Buscar por cliente ou CPF..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-group">
            <label>Mês</label>
            <select value={filters.month} onChange={(e) => setFilters(prev => ({...prev, month: e.target.value}))}>
              <option value="ALL">Todos</option>
              {monthOptions.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>
          <div className="filter-group">
            <label>Ano</label>
            <select value={filters.year} onChange={(e) => setFilters(prev => ({...prev, year: e.target.value}))}>
              <option value="ALL">Todos</option>
              {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div className="filter-group">
            <label>Status</label>
            <select value={filters.status} onChange={(e) => setFilters(prev => ({...prev, status: e.target.value}))}>
              <option value="ALL">Todos</option>
              <option value="PENDENTE">Pendente</option>
              <option value="VENDIDO">Vendido</option>
            </select>
          </div>
           <div className="filter-group">
            <label>Ordenar por</label>
            <select value={filters.order} onChange={(e) => setFilters(prev => ({...prev, order: e.target.value}))}>
              <option value="date_desc">Mais Recentes</option>
              <option value="date_asc">Mais Antigas</option>
              <option value="value_desc">Maior Valor</option>
            </select>
          </div>
      </div>

      <div className="table-wrapper card-base">
        <table>
          <thead>
            <tr>
              <th>ID Venda</th>
              <th>Cliente</th>
              <th>Valor</th>
              <th>Data</th>
              <th>Status</th>
            </tr>
          </thead>
            <AnimatePresence>
                <tbody>
                {isLoading ? <TableSkeleton /> : 
                 error ? <EmptyState message={error} /> :
                 sales.length > 0 ? (
                    sales.map(sale => (
                    <motion.tr 
                        key={sale.id} 
                        onClick={() => handleRowClick(sale)}
                        variants={rowVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        layout
                        className="clickable-row"
                    >
                        <td>#{sale.id}</td>
                        <td>{sale.clientName}</td>
                        <td>{formatCurrency(sale.value)}</td>
                        <td>{formatDate(sale.dateCreated)}</td>
                        <td>{getStatusBadge(sale.status)}</td>
                    </motion.tr>
                    ))
                ) : (
                    <EmptyState message="Nenhuma venda encontrada para os filtros selecionados." />
                )}
                </tbody>
            </AnimatePresence>
        </table>
      </div>
      
      {totalPages > 1 && !isLoading && (
        <div className="pagination-controls">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Anterior</button>
          <span>Página {page} de {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Próxima</button>
        </div>
      )}
    </div>
  );
};

export default Vendas;