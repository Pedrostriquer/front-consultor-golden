import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import extractService from "../../dbServices/extractService";
import "./Extrato.css";

// --- Funções Auxiliares ---
const formatCurrency = (value) => {
  const formattedValue = `R$ ${(Math.abs(value) || 0).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
  return formattedValue;
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

// Modificado para ser mais robusto, considerando apenas recebimentos de comissão.
// No futuro, se houver saques, a lógica pode ser expandida.
const getTransactionType = (description) => {
  const lowerDesc = description.toLowerCase();
  if (lowerDesc.includes("saque") || lowerDesc.includes("débito")) {
    return "debit";
  }
  // Assume que tudo mais (comissões, recibos) é crédito.
  return "credit";
};

// --- Componentes de UI ---
const TableSkeleton = ({ rows = 7 }) => (
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

// --- Componente Principal ---
const Extrato = () => {
  const [extractData, setExtractData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState({
    pageNumber: 1,
    totalPages: 1,
  });

  const pageSize = 7;

  const fetchExtract = useCallback(
    async (pageToFetch) => {
      setIsLoading(true);
      setError("");
      try {
        const response = await extractService.getConsultantExtract(
          pageToFetch,
          pageSize
        );
        setExtractData(response.items || []);
        setPagination((prev) => ({
          ...prev,
          totalPages: Math.ceil(response.totalCount / pageSize) || 1,
        }));
      } catch (err) {
        setError("Falha ao carregar o extrato.");
        setExtractData([]);
      } finally {
        setIsLoading(false);
      }
    },
    [pageSize]
  ); // Removido pagination.pageNumber das dependências

  useEffect(() => {
    fetchExtract(pagination.pageNumber);
  }, [pagination.pageNumber, fetchExtract]);

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.totalPages && !isLoading) {
      setPagination((prev) => ({ ...prev, pageNumber: newPage }));
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
        <p>Acompanhe as suas movimentações de comissões e saques.</p>
      </motion.div>

      <motion.div className="card-base extrato-content" variants={itemVariants}>
        {error && <p className="error-message">{error}</p>}
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
              <TableSkeleton rows={pageSize} />
            ) : (
              <tbody>
                {extractData.length > 0 ? (
                  extractData.map((item, index) => {
                    const type = getTransactionType(item.description);
                    const formattedValue = formatCurrency(item.value);
                    return (
                      <motion.tr
                        key={`${pagination.pageNumber}-${index}`}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <td className="icon-cell">
                          <div className={`transaction-icon ${type}`}>
                            <i
                              className={
                                type === "credit"
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
                            {formatDate(item.dateCreated)}
                          </div>
                        </td>
                        <td className={`text-right amount-${type}`}>
                          {type === "credit" ? "+" : "-"} {formattedValue}
                        </td>
                      </motion.tr>
                    );
                  })
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
              <i className="fa-solid fa-chevron-left"></i> Anterior
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
              Próxima <i className="fa-solid fa-chevron-right"></i>
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default Extrato;
