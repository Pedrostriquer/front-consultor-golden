import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import clientService from '../../dbServices/clientService';
import { useAuth } from '../../Context/AuthContext';
import useDebounce from '../../hooks/useDebounce';
import './Clientes.css';

// --- Logos ---
import goldenLogo from '../../img/logo-golden-ouro2.png';
import diamondLogo from '../../img/diamond_prime_diamond (1).png';


// --- Componentes de UI Locais ---
const PlatformLogo = ({ platform }) => (
    <div className="platform-logo-wrapper">
        <img src={platform === 'Golden Brasil' ? goldenLogo : diamondLogo} alt={platform} className="platform-logo-small" title={platform} />
    </div>
);

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

const TableSkeleton = ({ rows = 10 }) => (
    <tbody>
      {[...Array(rows)].map((_, i) => (
        <tr key={i} className="skeleton-row">
          <td><div className="skeleton-bar" style={{ width: "30px" }}></div></td>
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
  const { user } = useAuth();

  // --- ESTADO DOS FILTROS UNIFICADO ---
  const [filters, setFilters] = useState({
    sortBy: 'name',
    sortOrder: 'asc',
    platform: 'all', // Novo filtro de plataforma
  });
  
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const debouncedFilters = useDebounce(filters, 500);

  const fetchClients = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    setError('');

    const pageSize = 10;
    const params = {
      sortBy: debouncedFilters.sortBy,
      sortOrder: debouncedFilters.sortOrder,
      searchTerm: debouncedSearchTerm,
      pageNumber: page,
      pageSize: pageSize,
      consultantId: user.id,
    };

    try {
      const response = await clientService.searchClients(params);
      // Simulação: Adiciona a propriedade 'platform' aos clientes recebidos
      const clientsWithPlatform = response.items.map(client => ({
          ...client,
          platform: 'Golden Brasil'
      }));
      setClients(clientsWithPlatform);
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
  
  // --- LÓGICA DE FILTRAGEM NO FRONT-END ---
  const visibleClients = useMemo(() => {
    if (filters.platform === 'all') {
      return clients;
    }
    return clients.filter(client => 
        (filters.platform === 'golden' && client.platform === 'Golden Brasil') ||
        (filters.platform === 'diamond' && client.platform === 'Diamond Prime')
    );
  }, [clients, filters.platform]);

  const handleRowClick = (client) => {
    navigate(`/platform/clientes/${client.cpfCnpj}`);
  };

  const sortOptions = [{ label: 'Nome', value: 'name' }];
  
  const rowVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  };

  return (
    <div className="clientes-page">
      <div className="page-header">
        <h1>Meus Clientes</h1>
      </div>

      {/* --- NOVO CONTAINER DE FILTROS UNIFICADO --- */}
      <div className="filters-container card-base">
          {/* BARRA DE BUSCA MOVIDA PARA CÁ */}
          <div className="search-bar">
            <i className="fa-solid fa-magnifying-glass"></i>
            <input 
              type="text" 
              placeholder="Buscar por nome ou CPF/CNPJ..."
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
          {/* FILTRO DE ORDENAÇÃO */}
          <div className="filter-group">
            <label>Ordenar por</label>
            <select onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split(':');
                setFilters(prev => ({...prev, sortBy, sortOrder}));
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
              <th className="platform-col"></th> {/* Coluna para a logo */}
              <th>Nome</th>
              <th>CPF/CNPJ</th>
              <th>Email</th>
              <th>Celular</th>
            </tr>
          </thead>
          {isLoading ? (
             <TableSkeleton rows={5} />
          ) : (
            <AnimatePresence>
                <tbody>
                {error && <tr><td colSpan="5">{error}</td></tr>}
                {!error && visibleClients.length > 0 ? (
                    visibleClients.map(client => (
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
                        {/* Coluna da logo adicionada */}
                        <td className="platform-col"><PlatformLogo platform={client.platform} /></td>
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
                    message={searchTerm || filters.platform !== 'all'
                        ? `A sua busca ou filtro não retornou resultados.`
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