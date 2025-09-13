import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import consultantService from "../../../../dbServices/consultantService";
import LoadingScreen from "../../../LoadingScreen/LoadingScreen";
import "./ContractDetailPage.css";

const formatCurrency = (value) => {
  if (value === null || value === undefined) return "R$ 0,00";
  return `R$${value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("pt-BR");
};

const getStatusBadge = (status) => {
  const statusMap = {
    1: { text: "Pendente", className: "status-pending" },
    2: { text: "Valorizando", className: "status-active" },
    3: { text: "Cancelado", className: "status-canceled" },
    4: { text: "Concluído", className: "status-completed" },
  };
  const { text, className } = statusMap[status] || {
    text: "Desconhecido",
    className: "",
  };
  return <span className={`status-badge ${className}`}>{text}</span>;
};

const ContractDetailPage = () => {
  const { clientId, contractId } = useParams();
  const [contract, setContract] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [lightboxImage, setLightboxImage] = useState(null);

  useEffect(() => {
    const fetchContract = async () => {
      setIsLoading(true);
      try {
        const response = await consultantService.getContractDetails(
          clientId,
          contractId
        );
        setContract(response.data);
      } catch (err) {
        setError(
          "Contrato não encontrado ou você não tem permissão para vê-lo."
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetchContract();
  }, [clientId, contractId]);

  if (isLoading) return <LoadingScreen />;
  if (error)
    return <div className="contract-detail-page error-message">{error}</div>;
  if (!contract) return null;

  const progress = Math.min(
    100,
    (contract.currentIncome / (contract.finalAmount - contract.amount)) * 100 ||
      0
  );

  return (
    <div className="contract-detail-page">
      <div className="contract-page-header">
        <Link to={`/platform/clientes/${clientId}`} className="back-button">
          <i className="fa-solid fa-arrow-left"></i> Voltar para{" "}
          {contract.clientName}
        </Link>
      </div>

      <div className="contract-main-info card-base">
        <div>
          <h1 className="contract-title">Contrato #{contract.id}</h1>
          <p className="client-link">Cliente: {contract.clientName}</p>
        </div>
        <div className="contract-status-box">
          <span>Status</span>
          {getStatusBadge(contract.status)}
        </div>
      </div>

      <div className="progress-card card-base">
        <div className="progress-text">
          <p>Progresso de Rendimento</p>
          <p>
            {formatCurrency(contract.currentIncome)} de{" "}
            {formatCurrency(contract.finalAmount - contract.amount)}
          </p>
        </div>
        <div className="progress-bar-container">
          <div
            className="progress-bar-fill"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <span className="progress-percentage">{progress.toFixed(2)}%</span>
      </div>

      <div className="details-grid">
        <div className="details-card card-base">
          <h3>Valores</h3>
          <ul>
            <li>
              <span>Valor Investido:</span>{" "}
              <strong>{formatCurrency(contract.amount)}</strong>
            </li>
            <li>
              <span>Valor Final Estimado:</span>{" "}
              <strong>{formatCurrency(contract.finalAmount)}</strong>
            </li>
            <li>
              <span>Rendimento Mensal:</span>{" "}
              <strong>{contract.gainPercentage}%</strong>
            </li>
          </ul>
        </div>
        <div className="details-card card-base">
          <h3>Datas</h3>
          <ul>
            <li>
              <span>Data de Criação:</span> {formatDate(contract.dateCreated)}
            </li>
            <li>
              <span>Data de Ativação:</span>{" "}
              {formatDate(contract.activationDate)}
            </li>
            <li>
              <span>Data de Vencimento:</span>{" "}
              {formatDate(contract.endContractDate)}
            </li>
            <li>
              <span>Duração:</span> {contract.duration} meses
            </li>
          </ul>
        </div>
        <div className="details-card card-base">
          <h3>Comissão</h3>
          <ul>
            <li>
              <span>Recebeu Comissão:</span>
              {contract.commissionExists ? (
                <strong className="commission-yes-text">Sim</strong>
              ) : (
                "Não"
              )}
            </li>
            <li>
              <span>Valor da Comissão:</span>
              <strong>
                {contract.commissionExists
                  ? formatCurrency(contract.commissionAmount)
                  : "N/A"}
              </strong>
            </li>
            <li>
              <span>Status da Comissão:</span>
              {getStatusBadge(contract.commissionStatus)}
            </li>
          </ul>
        </div>
      </div>
      <div className="files-card card-base">
        <h3>Documentos e Mídias</h3>
        <div className="files-section">
          <div className="media-gallery">
            <h4>Mídias da Gema ({contract.rockData?.length || 0})</h4>
            {contract.rockData && contract.rockData.length > 0 ? (
              <div className="image-grid">
                {contract.rockData.map((url, index) => (
                  <div
                    key={index}
                    className="image-thumbnail"
                    onClick={() => setLightboxImage(url)}
                  >
                    <img src={url} alt={`Mídia ${index + 1}`} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-files-text">Nenhuma mídia adicionada.</p>
            )}
          </div>
          <div className="certificates-list">
            <h4>Certificados ({contract.certificados?.length || 0})</h4>
            {contract.certificados && contract.certificados.length > 0 ? (
              <ul>
                {contract.certificados.map((url, index) => {
                  const fileName = url
                    .split("%2F")
                    .pop()
                    .split("?")[0]
                    .substring(37);
                  return (
                    <li key={index}>
                      <a href={url} target="_blank" rel="noopener noreferrer">
                        <i className="fa-solid fa-file-arrow-down"></i>{" "}
                        {fileName}
                      </a>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="no-files-text">Nenhum certificado adicionado.</p>
            )}
          </div>
        </div>
      </div>

      {lightboxImage && (
        <div
          className="lightbox-backdrop"
          onClick={() => setLightboxImage(null)}
        >
          <div className="lightbox-content">
            <img src={lightboxImage} alt="Visualização ampliada" />
            <button
              className="lightbox-close"
              onClick={() => setLightboxImage(null)}
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractDetailPage;
