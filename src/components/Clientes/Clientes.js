import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import clientService from '../../dbServices/clientService';
import { useAuth } from '../../Context/AuthContext';
import useDebounce from '../../hooks/useDebounce';
import './Clientes.css';

// --- Componentes de UI Locais ---

const EmptyState = ({ icon, title, message }) => (
  <tr>
    <td colSpan="4">
      <div className="empty-state">
        <div className="empty-state-icon"><i className={icon}></i></div>
        <h3 className="empty-state-title">{title}</h3>
        <p className="empty-state-message">{message}</p>
      </div>
    </td>
  </tr>
);

const TableSkeleton = ({ rows = 10 }) => (
    <tbody>
      {[...Array(rows)].map((_, i) => (
        <tr key={i} className="skeleton-row">
          <td><div className="skeleton-bar" style={{ width: "80%" }}></div></td>
          <td><div className="skeleton-bar" style={{ width: "60%" }}></div></td>
          <td><div className="skeleton-bar" style={{ width: "90%" }}></div></td>
          <td><div className="skeleton-bar" style={{ width: "70%" }}></div></td>
        </tr>
      ))}
    </tbody>
  );

// --- Componente Principal ---
const Clientes = () => {
  const [clients, setClients] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth(); // Pega o utilizador logado do contexto

  const [filters, setFilters] = useState({
    sortBy: 'name',
    sortOrder: 'asc',
  });
  
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const debouncedFilters = useDebounce(filters, 500);

  const fetchClients = useCallback(async () => {
    if (!user) return; // Não faz a busca se o utilizador ainda não carregou
    setIsLoading(true);
    setError('');

    const pageSize = 10;
    const params = {
      ...debouncedFilters,
      searchTerm: debouncedSearchTerm,
      pageNumber: page,
      pageSize: pageSize,
      consultantId: user.id, // Passa o ID do consultor logado para a API
    };

    try {
      const response = await clientService.searchClients(params);
      setClients(response.items);
      setTotalPages(Math.ceil(response.totalCount / pageSize) || 1);
    } catch (err) {
      console.error("Erro ao buscar clientes:", err);
      setError("Não foi possível carregar os clientes. Tente novamente mais tarde.");
    } finally {
        setIsLoading(false);
    }

  }, [page, debouncedSearchTerm, debouncedFilters, user]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  useEffect(() => { setPage(1); }, [debouncedSearchTerm, debouncedFilters]);

  const handleRowClick = (client) => {
    // Navega para a página de detalhes usando o CPF/CNPJ do cliente
    navigate(`/platform/clientes/${client.cpfCnpj}`);
  };

  const sortOptions = [
    { label: 'Nome', value: 'name' },
  ];
  
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
              placeholder="Buscar por nome ou CPF/CNPJ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Filtros simplificados para ordenação */}
      <div className="filters-container card-base">
          <div className="filter-group">
            <label>Ordenar por</label>
            <select onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split(':');
                setFilters({ sortBy, sortOrder });
            }} value={`${filters.sortBy}:${filters.sortOrder}`}>
              {sortOptions.map(sort => (
                <optgroup label={sort.label} key={sort.label}>
                  <option value={`${sort.value}:asc`}>A-Z</option>
                  <option value={`${sort.value}:desc`}>Z-A</option>
                </optgroup>
              ))}
            </select>
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
            </tr>
          </thead>
          {isLoading ? (
             <TableSkeleton />
          ) : (
            <AnimatePresence>
                <tbody>
                {error && <tr><td colSpan="4" className="error-cell">{error}</td></tr>}
                {!error && clients.length > 0 ? (
                    clients.map(client => (
                    <motion.tr 
                        key={client.id} 
                        onClick={() => handleRowClick(client)}
                        variants={rowVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        layout
                        className="clickable-row"
                    >
                        <td>{client.name}</td>
                        <td>{client.cpfCnpj}</td>
                        <td>{client.email}</td>
                        <td>{client.phoneNumber}</td>
                    </motion.tr>
                    ))
                ) : (
                    !isLoading && !error && <EmptyState 
                    icon="fa-solid fa-users-slash"
                    title="Nenhum cliente encontrado"
                    message={searchTerm 
                        ? `A sua busca não retornou resultados.`
                        : "Você ainda não possui clientes cadastrados."
                    }
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