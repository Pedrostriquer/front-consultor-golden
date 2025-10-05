import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import clientService from "../../dbServices/clientService";
import { useAuth } from "../../Context/AuthContext";
import useDebounce from "../../hooks/useDebounce";
import "./Clientes.css";

// --- Logos ---
import goldenLogo from "../../img/logo-golden-ouro2.png";
import diamondLogo from "../../img/diamond_prime_diamond (1).png";

// --- Componentes de UI Locais ---
const PlatformLogo = ({ platformId }) => {
  const isGolden = platformId === 1 || platformId === "CONTRATO_DE_MINERIOS";
  const platform = isGolden ? "Golden Brasil" : "Diamond Prime";
  return (
    <div className="platform-logo-wrapper">
      <img
        src={isGolden ? goldenLogo : diamondLogo}
        alt={platform}
        className="platform-logo-small"
        title={platform}
      />
    </div>
  );
};

const EmptyState = ({ icon, title, message }) => (
  <tr>
    <td colSpan="4">
      <div className="empty-state">
        <div className="empty-state-icon">
          <i className={icon}></i>
        </div>
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
        <td>
          <div className="skeleton-bar" style={{ width: "30px" }}></div>
        </td>
        <td>
          <div className="skeleton-bar" style={{ width: "80%" }}></div>
        </td>
        <td>
          <div className="skeleton-bar" style={{ width: "60%" }}></div>
        </td>
        <td>
          <div className="skeleton-bar" style={{ width: "90%" }}></div>
        </td>
      </tr>
    ))}
  </tbody>
);

// --- Componente Principal ---
const Clientes = () => {
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();

  const [filters, setFilters] = useState({
    sortBy: "dateCreated",
    sortOrder: "desc",
    platform: "all",
  });

  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const debouncedFilters = useDebounce(filters, 500);

  const fetchClients = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    setError("");

    const platformId =
      debouncedFilters.platform === "golden"
        ? 1
        : debouncedFilters.platform === "diamond"
        ? 2
        : undefined;
    const isCpfCnpj = /^\d+$/.test(debouncedSearchTerm.replace(/[.-/]/g, ""));

    const params = {
      consultantId: user.id,
      name: !isCpfCnpj ? debouncedSearchTerm : undefined,
      cpfCnpj: isCpfCnpj ? debouncedSearchTerm : undefined,
      platformId,
      sortBy: debouncedFilters.sortBy,
      sortDirection: debouncedFilters.sortOrder,
    };

    try {
      const response = await clientService.searchClients(params);
      setClients(response);
    } catch (err) {
      // <-- A CORREÇÃO ESTÁ AQUI
      console.error("Erro ao buscar clientes:", err);
      setError(
        "Não foi possível carregar os clientes. Tente novamente mais tarde."
      );
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearchTerm, debouncedFilters, user]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleRowClick = (client) => {
    navigate(`/platform/clientes/${client.cpfCnpj}`, {
      state: { platformId: client.platformId },
    });
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
      </div>

      <div className="filters-container card-base">
        <div className="search-bar">
          <i className="fa-solid fa-magnifying-glass"></i>
          <input
            type="text"
            placeholder="Buscar por nome ou CPF/CNPJ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label>Plataforma</label>
          <select
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, platform: e.target.value }))
            }
            value={filters.platform}
          >
            <option value="all">Todas as Plataformas</option>
            <option value="golden">Golden Brasil (Contratos)</option>
            <option value="diamond">Diamond Prime</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Ordenar por</label>
          <select
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split(":");
              setFilters((prev) => ({ ...prev, sortBy, sortOrder }));
            }}
            value={`${filters.sortBy}:${filters.sortOrder}`}
          >
            <option value="dateCreated:desc">Mais Recentes</option>
            <option value="dateCreated:asc">Mais Antigos</option>
          </select>
        </div>
      </div>

      <div className="table-wrapper card-base">
        <table>
          <thead>
            <tr>
              <th className="platform-col"></th>
              <th>Nome</th>
              <th>CPF/CNPJ</th>
              <th>Email</th>
            </tr>
          </thead>
          {isLoading ? (
            <TableSkeleton rows={10} />
          ) : (
            <AnimatePresence>
              <tbody>
                {error && (
                  <tr>
                    <td colSpan="4" className="error-cell">
                      {error}
                    </td>
                  </tr>
                )}
                {!error && clients.length > 0
                  ? clients.map((client) => (
                      <motion.tr
                        key={`${client.cpfCnpj}-${client.platformId}`}
                        onClick={() => handleRowClick(client)}
                        variants={rowVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        layout
                        className="clickable-row"
                      >
                        <td className="platform-col">
                          <PlatformLogo platformId={client.platformId} />
                        </td>
                        <td>{client.name}</td>
                        <td>{client.cpfCnpj}</td>
                        <td>{client.email}</td>
                      </motion.tr>
                    ))
                  : !isLoading &&
                    !error && (
                      <EmptyState
                        icon="fa-solid fa-users-slash"
                        title="Nenhum cliente encontrado"
                        message="A sua busca ou filtro não retornou resultados."
                      />
                    )}
              </tbody>
            </AnimatePresence>
          )}
        </table>
      </div>
    </div>
  );
};

export default Clientes;
