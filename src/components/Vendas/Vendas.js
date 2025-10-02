import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import saleService from '../../dbServices/saleService';
import { useAuth } from '../../Context/AuthContext';
import useDebounce from '../../hooks/useDebounce';
import './Vendas.css';

// --- Logos ---
import goldenLogo from '../../img/logo-golden-ouro2.png';
import diamondLogo from '../../img/diamond_prime_diamond (1).png';


// --- Funções Auxiliares e Componentes de UI ---
const formatCurrency = (value) => `R$${(value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const PlatformLogo = ({ platform }) => (
    <div className="platform-logo-wrapper">
        <img src={platform === 'Golden Brasil' ? goldenLogo : diamondLogo} alt={platform} className="platform-logo-small" title={platform} />
    </div>
);

const getStatusBadge = (status) => {
    const statusText = status ? status.toUpperCase() : 'DESCONHECIDO';
    const statusMap = {
      'PENDENTE': { text: "Pendente", className: "status-pending" },
      'VENDIDO': { text: "Vendido", className: "status-active" },
      'RECEBIDO': { text: "Recebido", className: "status-completed" },
      'CANCELADO': { text: "Cancelado", className: "status-canceled" },
    };
    const { text, className } = statusMap[statusText] || { text: statusText, className: ""};
    return <span className={`status-badge ${className}`}>{text}</span>;
};

const EmptyState = ({ icon, title, message }) => (
    <tr>
      <td colSpan="5"> {/* Aumentado para 5 colunas */}
        <div className="empty-state">
          <div className="empty-state-icon"><i className={icon}></i></div>
          <h3 className="empty-state-title">{title}</h3>
          <p className="empty-state-message">{message}</p>
        </div>
      </td>
    </tr>
);

const TableSkeleton = () => (
    <tbody>
      {[...Array(10)].map((_, i) => (
        <tr key={i} className="skeleton-row">
          <td><div className="skeleton-bar" style={{width: '30px'}}></div></td>
          <td><div className="skeleton-bar"></div></td>
          <td><div className="skeleton-bar"></div></td>
          <td><div className="skeleton-bar"></div></td>
          <td><div className="skeleton-bar"></div></td>
        </tr>
      ))}
    </tbody>
);

// --- Componente Principal ---
const Vendas = () => {
  const [sales, setSales] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  const [filters, setFilters] = useState({
    status: 'ALL',
    platform: 'all', // Novo filtro de plataforma
    sortBy: 'id',
    sortOrder: 'desc'
  });

  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const debouncedFilters = useDebounce(filters, 500);

  const fetchSales = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    
    const params = {
      status: debouncedFilters.status,
      sortBy: debouncedFilters.sortBy,
      sortOrder: debouncedFilters.sortOrder,
      searchTerm: debouncedSearchTerm,
      pageNumber: page,
      pageSize: 10,
      consultantId: user.id,
    };

    try {
        const response = await saleService.searchSales(params);
        // Simulação: Adiciona a propriedade 'platform' às vendas recebidas
        const salesWithPlatform = response.sales.map(sale => ({
            ...sale,
            platform: 'Golden Brasil'
        }));
        setSales(salesWithPlatform);
        setTotalPages(Math.ceil(response.totalCount / 10) || 1);
    } catch (error) {
        console.error("Erro ao buscar vendas:", error);
    } finally {
        setIsLoading(false);
    }
  }, [page, debouncedSearchTerm, debouncedFilters, user]);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  useEffect(() => { setPage(1); }, [debouncedSearchTerm, debouncedFilters]);

  // --- LÓGICA DE FILTRAGEM POR PLATAFORMA NO FRONT-END ---
  const visibleSales = useMemo(() => {
    if (filters.platform === 'all') {
      return sales;
    }
    return sales.filter(sale => 
        (filters.platform === 'golden' && sale.platform === 'Golden Brasil') ||
        (filters.platform === 'diamond' && sale.platform === 'Diamond Prime')
    );
  }, [sales, filters.platform]);

  const handleRowClick = (sale) => {
    navigate(`/platform/vendas/${sale.id}/detalhes`);
  };

  const rowVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  };

  return (
    <div className="vendas-page">
      <div className="page-header">
        <h1>Vendas</h1>
      </div>

      <div className="filters-container card-base">
          <div className="search-bar">
            <i className="fa-solid fa-magnifying-glass"></i>
            <input 
              type="text" 
              placeholder="Buscar por cliente, ID do contrato..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {/* FILTRO DE PLATAFORMA NOVO */}
          <div className="filter-group">
            <label>Plataforma</label>
            <select onChange={(e) => setFilters(prev => ({...prev, platform: e.target.value}))} value={filters.platform}>
                <option value="all">Todas as Plataformas</option>
                <option value="golden">Golden Brasil</option>
                <option value="diamond">Diamond Prime</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Status da Venda</label>
            <select name="status" value={filters.status} onChange={(e) => setFilters(prev => ({...prev, status: e.target.value}))}>
              <option value="ALL">Todos</option>
              <option value="PENDENTE">Pendente</option>
              <option value="VENDIDO">Vendido</option>
              <option value="RECEBIDO">Recebido</option>
              <option value="CANCELADO">Cancelado</option>
            </select>
          </div>
      </div>

      <div className="table-wrapper card-base">
        <table>
          <thead>
            <tr>
              <th className="platform-col"></th>
              <th>ID Venda</th>
              <th>Cliente</th>
              <th>Valor</th>
              <th>Status</th>
            </tr>
          </thead>
          {isLoading ? (
            <TableSkeleton />
          ) : (
            <AnimatePresence>
                <tbody>
                {visibleSales.length > 0 ? (
                    visibleSales.map(sale => (
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
                        <td className="platform-col"><PlatformLogo platform={sale.platform} /></td>
                        <td>#{sale.id}</td>
                        <td>{sale.client?.name || 'Cliente não informado'}</td>
                        <td>{formatCurrency(sale.value)}</td>
                        <td>{getStatusBadge(sale.status)}</td>
                    </motion.tr>
                    ))
                ) : (
                    <EmptyState 
                    icon="fa-solid fa-file-invoice-dollar"
                    title="Nenhuma venda encontrada"
                    message="A sua busca ou filtro não retornou resultados."
                    />
                )}
                </tbody>
            </AnimatePresence>
          )}
        </table>
      </div>
      
      {totalPages > 1 && !isLoading && (
        <div className="pagination-controls">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
            <i className="fa-solid fa-chevron-left"></i> Anterior
          </button>
          <span>Página {page} de {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
            Próxima <i className="fa-solid fa-chevron-right"></i>
          </button>
        </div>
      )}
    </div>
  );
};

export default Vendas;