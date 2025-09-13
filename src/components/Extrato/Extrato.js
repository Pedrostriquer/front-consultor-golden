import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../Context/AuthContext";
import consultantService from "../../dbServices/consultantService";
import "./Extrato.css";

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

const Extrato = () => {
  const { user } = useAuth();
  const [extractData, setExtractData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState({
    pageNumber: 1,
    totalPages: 1,
  });
  const [filters, setFilters] = useState({ type: "all" });

  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
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
    setSelectedItem(item);
    setIsModalOpen(true);
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

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
    setModalDetails(null);
  };

  return (
    <div className="extrato-page">
      <div className="page-header">
        <h1>Extrato Financeiro</h1>
        <p>Acompanhe suas movimentações de comissões e saques.</p>
      </div>

      <div className="card-base extrato-content">
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
                <th>Data</th>
                <th>Descrição</th>
                <th className="text-right">Valor</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="3" className="loading-cell">
                    Carregando...
                  </td>
                </tr>
              ) : extractData.length > 0 ? (
                extractData.map((item) => (
                  <tr
                    key={`${item.type}-${item.transactionId}`}
                    onClick={() => handleRowClick(item)}
                    className="clickable-row"
                  >
                    <td>{formatDate(item.date)}</td>
                    <td>{item.description}</td>
                    <td
                      className={`text-right amount-${item.type.toLowerCase()}`}
                    >
                      {item.type === "Credit" ? "+" : "-"}{" "}
                      {formatCurrency(item.amount)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="empty-cell">
                    Nenhuma transação encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

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
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal-btn" onClick={closeModal}>
              &times;
            </button>
            <h3>Detalhes da Transação</h3>
            {isModalLoading ? (
              <p>Carregando detalhes...</p>
            ) : modalDetails ? (
              <div className="modal-details-grid">
                <div className="detail-item">
                  <span>Tipo:</span>
                  <strong>{modalDetails.type}</strong>
                </div>
                <div className="detail-item">
                  <span>ID da Transação:</span>
                  <strong>#{modalDetails.id}</strong>
                </div>
                <div className="detail-item">
                  <span>Data:</span>
                  <strong>{formatDate(modalDetails.dateCreated)}</strong>
                </div>
                {modalDetails.paidDate && (
                  <div className="detail-item">
                    <span>Data do Pagamento:</span>
                    <strong>{formatDate(modalDetails.paidDate)}</strong>
                  </div>
                )}
                <div className="detail-item">
                  <span>Valor:</span>
                  <strong
                    className={`amount-${
                      modalDetails.type === "Saque" ? "debit" : "credit"
                    }`}
                  >
                    {formatCurrency(
                      modalDetails.commissionAmount ||
                        modalDetails.amountWithdrawn
                    )}
                  </strong>
                </div>
                {modalDetails.client && (
                  <div className="detail-item">
                    <span>Cliente:</span>
                    <strong>{modalDetails.client.name}</strong>
                  </div>
                )}
                {modalDetails.contractId && (
                  <div className="detail-item">
                    <span>Contrato Ref.:</span>
                    <strong>#{modalDetails.contractId}</strong>
                  </div>
                )}
                <div className="detail-item full-width">
                  <span>Descrição:</span>
                  <p>{modalDetails.description}</p>
                </div>
              </div>
            ) : (
              <p>Não foi possível carregar os detalhes.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Extrato;
