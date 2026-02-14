import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import clientService from "../../dbServices/clientService";
import { useAuth } from "../../Context/AuthContext";
import useDebounce from "../../hooks/useDebounce";
import "./Clientes.css";

import goldenLogo from "../../img/logo-golden-ouro2.png";
import diamondLogo from "../../img/diamond_prime_diamond (1).png";

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

const TableSkeleton = ({ rows = 5 }) => (
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

const Clientes = () => {
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const navigate = useNavigate();
  const { user } = useAuth();

  const [filters, setFilters] = useState({
    sortBy: "dateCreated",
    sortOrder: "desc",
    platform: "all",
  });

  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const debouncedFilters = useDebounce(filters, 500);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, debouncedFilters]);

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

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentClients = clients.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(clients.length / itemsPerPage);

  const handleRowClick = (client) => {
    navigate(`/platform/clientes/${client.cpfCnpj}`, {
      state: { platformId: client.platformId },
    });
  };

  const rowVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.2 } },
    exit: { opacity: 0, x: 10, transition: { duration: 0.1 } },
  };

  return (
    <div className="clientes-page">
      <div className="page-header">
        <div>
          <h1>Meus Clientes</h1>
          {!isLoading && (
            <p className="total-count">
              Total: <strong>{clients.length}</strong>{" "}
              {clients.length === 1 ? "cliente" : "clientes"}
            </p>
          )}
        </div>
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
            <TableSkeleton rows={5} />
          ) : (
            <AnimatePresence mode="wait">
              <tbody key={currentPage}>
                {error && (
                  <tr>
                    <td colSpan="4" className="error-cell">
                      {error}
                    </td>
                  </tr>
                )}
                {!error && currentClients.length > 0
                  ? currentClients.map((client) => (
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

      {!isLoading && clients.length > itemsPerPage && (
        <div className="pagination-controls">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
          >
            <i className="fa-solid fa-chevron-left"></i> Anterior
          </button>
          <span>
            Página {currentPage} de {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
          >
            Próximo <i className="fa-solid fa-chevron-right"></i>
          </button>
        </div>
      )}
    </div>
  );
};

export default Clientes;
