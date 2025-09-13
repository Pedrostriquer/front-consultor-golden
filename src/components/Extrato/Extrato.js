import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import consultantService from "../../dbServices/consultantService";
import "./Extrato.css";

// --- Funções Auxiliares ---
const formatCurrency = (value) => {
  if (value === null || value === undefined) return "R$ 0,00";
  return `R$${value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatDate = (dateString) => {
  if (!dateString) return "-";
  const options = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return new Date(dateString).toLocaleString("pt-BR", options);
};

// --- Componentes Locais de UI ---

const TableSkeleton = ({ rows = 10 }) => (
  <tbody>
    {[...Array(rows)].map((_, i) => (
      <tr key={i} className="skeleton-row">
        <td className="icon-cell">
          <div className="skeleton-circle"></div>
        </td>
        <td>
          <div className="skeleton-bar" style={{ width: "80%" }}></div>
          <div
            className="skeleton-bar"
            style={{ width: "50%", marginTop: "8px" }}
          ></div>
        </td>
        <td className="text-right">
          <div
            className="skeleton-bar"
            style={{ width: "60%", marginLeft: "auto" }}
          ></div>
        </td>
      </tr>
    ))}
  </tbody>
);

const TransactionModal = ({ details, isLoading, onClose }) => {
  if (!details && !isLoading) return null;

  const typeInfo =
    details?.type === "Comissão"
      ? { icon: "fa-solid fa-arrow-up", colorClass: "credit" }
      : { icon: "fa-solid fa-arrow-down", colorClass: "debit" };

  return (
    <motion.div
      className="modal-overlay"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
      >
        <button className="close-modal-btn" onClick={onClose}>
          &times;
        </button>
        {isLoading ? (
          <div className="modal-loading">Carregando detalhes...</div>
        ) : details ? (
          <>
            <div className={`modal-header ${typeInfo.colorClass}`}>
              <div className="modal-icon">
                <i className={typeInfo.icon}></i>
              </div>
              <div>
                <h3>{details.type}</h3>
                <p>ID da Transação: #{details.id}</p>
              </div>
            </div>
            <div className="modal-details-grid">
              <div className="detail-item">
                <span>Valor</span>
                <strong className={`amount-${typeInfo.colorClass}`}>
                  {formatCurrency(
                    details.commissionAmount || details.amountWithdrawn
                  )}
                </strong>
              </div>
              <div className="detail-item">
                <span>Data</span>
                <strong>{formatDate(details.dateCreated)}</strong>
              </div>
              {details.paidDate && (
                <div className="detail-item">
                  <span>Data do Pagamento</span>
                  <strong>{formatDate(details.paidDate)}</strong>
                </div>
              )}
              {details.client && (
                <div className="detail-item">
                  <span>Cliente</span>
                  <strong>{details.client.name}</strong>
                </div>
              )}
              {details.contractId && (
                <div className="detail-item">
                  <span>Contrato Ref.</span>
                  <strong>#{details.contractId}</strong>
                </div>
              )}
              <div className="detail-item full-width">
                <span>Descrição</span>
                <p>{details.description}</p>
              </div>
            </div>
          </>
        ) : (
          <p>Não foi possível carregar os detalhes.</p>
        )}
      </motion.div>
    </motion.div>
  );
};

// --- Componente Principal ---
const Extrato = () => {
  const [extractData, setExtractData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState({
    pageNumber: 1,
    totalPages: 1,
  });
  const [filters, setFilters] = useState({ type: "all" });

  const [modalDetails, setModalDetails] = useState(null);
  const [isModalLoading, setIsModalLoading] = useState(false);

  const fetchExtract = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const params = {
        ...filters,
        pageNumber: pagination.pageNumber,
        pageSize: 10,
      };
      if (params.type === "all") delete params.type;

      const response = await consultantService.getConsultantExtract(params);
      setExtractData(response.data.items || []);
      setPagination((prev) => ({
        ...prev,
        totalPages:
          Math.ceil(response.data.totalCount / response.data.pageSize) || 1,
      }));
    } catch (err) {
      setError("Falha ao carregar o extrato.");
      setExtractData([]);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.pageNumber, filters]);

  useEffect(() => {
    fetchExtract();
  }, [fetchExtract]);

  const handleFilterChange = (e) => {
    setFilters({ type: e.target.value });
    setPagination((prev) => ({ ...prev, pageNumber: 1 }));
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, pageNumber: newPage }));
    }
  };

  const handleRowClick = async (item) => {
    setIsModalLoading(true);
    setModalDetails(null); 
    try {
      let details;
      if (item.type === "Credit") {
        const response = await consultantService.getIndicationDetails(
          item.transactionId
        );
        details = { ...response.data, type: "Comissão" };
      } else {
        const response = await consultantService.getWithdrawDetails(
          item.transactionId
        );
        details = { ...response.data, type: "Saque" };
      }
      setModalDetails(details);
    } catch (err) {
      console.error("Failed to fetch details", err);
    } finally {
      setIsModalLoading(false);
    }
  };

  const pageVariants = {
    initial: { opacity: 0 },
    in: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };
  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  return (
    <motion.div
      className="extrato-page"
      variants={pageVariants}
      initial="initial"
      animate="in"
    >
      <motion.div className="page-header" variants={itemVariants}>
        <h1>Extrato Financeiro</h1>
        <p>Acompanhe suas movimentações de comissões e saques.</p>
      </motion.div>

      <motion.div className="card-base extrato-content" variants={itemVariants}>
        <div className="extrato-controls">
          <div className="filter-group">
            <label htmlFor="type-filter">Mostrar:</label>
            <select
              id="type-filter"
              value={filters.type}
              onChange={handleFilterChange}
            >
              <option value="all">Todas as transações</option>
              <option value="credit">Apenas Entradas</option>
              <option value="debit">Apenas Saídas</option>
            </select>
          </div>
          {error && <p className="error-message">{error}</p>}
        </div>

        <div className="table-wrapper">
          <table className="extrato-table">
            <thead>
              <tr>
                <th style={{ width: "60px" }}></th>
                <th>Descrição</th>
                <th className="text-right">Valor</th>
              </tr>
            </thead>
            {isLoading ? (
              <TableSkeleton />
            ) : (
              <tbody>
                {extractData.length > 0 ? (
                  extractData.map((item) => (
                    <motion.tr
                      key={`${item.type}-${item.transactionId}`}
                      onClick={() => handleRowClick(item)}
                      className="clickable-row"
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <td className="icon-cell">
                        <div
                          className={`transaction-icon ${item.type.toLowerCase()}`}
                        >
                          <i
                            className={
                              item.type === "Credit"
                                ? "fa-solid fa-arrow-up"
                                : "fa-solid fa-arrow-down"
                            }
                          ></i>
                        </div>
                      </td>
                      <td>
                        <div className="transaction-description">
                          {item.description}
                        </div>
                        <div className="transaction-date">
                          {formatDate(item.date)}
                        </div>
                      </td>
                      <td
                        className={`text-right amount-${item.type.toLowerCase()}`}
                      >
                        {item.type === "Credit" ? "+" : "-"}
                        {formatCurrency(item.amount)}
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="empty-cell">
                      Nenhuma transação encontrada.
                    </td>
                  </tr>
                )}
              </tbody>
            )}
          </table>
        </div>

        {pagination.totalPages > 1 && (
          <div className="pagination-controls">
            <button
              onClick={() => handlePageChange(pagination.pageNumber - 1)}
              disabled={pagination.pageNumber === 1 || isLoading}
            >
              Anterior
            </button>
            <span>
              Página {pagination.pageNumber} de {pagination.totalPages}
            </span>
            <button
              onClick={() => handlePageChange(pagination.pageNumber + 1)}
              disabled={
                pagination.pageNumber === pagination.totalPages || isLoading
              }
            >
              Próximo
            </button>
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {(modalDetails || isModalLoading) && (
          <TransactionModal
            details={modalDetails}
            isLoading={isModalLoading}
            onClose={() => setModalDetails(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Extrato;