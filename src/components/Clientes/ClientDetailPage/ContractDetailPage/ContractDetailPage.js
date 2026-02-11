import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import "./ContractDetailPage.css";

function formatDate(dateString) {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "N/A";
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const year = date.getUTCFullYear();
  return `${day}/${month}/${year}`;
}

const formatCurrency = (value) =>
  `R$${(typeof value === "number" ? value : 0).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const getStatusBadge = (status, platform) => {
  const isDiamond =
    String(platform).toUpperCase() === "DIAMOND_PRIME" ||
    String(platform) === "2";
  const statusMap = isDiamond
    ? {
        1: { text: "Ativo", className: "status-active" },
        2: { text: "Finalizado", className: "status-default" },
      }
    : {
        1: { text: "Ativo", className: "status-active" },
        3: { text: "Cancelado", className: "status-canceled" },
      };
  const { text, className } = statusMap[status] || {
    text: `Status ${status}`,
    className: "status-default",
  };
  return <span className={`status-badge ${className}`}>{text}</span>;
};

const UniversalProgressBar = ({ progressInfo }) => {
  const { currentValue, maxValue, currentLabel, maxLabel, title } =
    progressInfo;
  const percentage = maxValue > 0 ? (currentValue / maxValue) * 100 : 0;

  return (
    <div className="progress-card card-base">
      <h3>{title}</h3>
      <div className="progress-container">
        <div className="progress-labels">
          <span>{currentLabel}</span>
          <span>{maxLabel}</span>
        </div>
        <div className="progress-bar-background">
          <motion.div
            className="progress-bar-fill"
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
      </div>
    </div>
  );
};

const ContractDetailPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [data] = useState(location.state || {});
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!data.contractData) {
      navigate("/platform/clientes");
    }
  }, [data, navigate]);

  if (!data.contractData) {
    return <div className="contract-detail-page">Carregando...</div>;
  }

  const { contractData, platformId, clientName } = data;
  const isDiamond =
    String(platformId).toUpperCase() === "DIAMOND_PRIME" ||
    String(platformId) === "2";

  const details = {};
  let progressInfo = {};

  if (isDiamond) {
    details.id = contractData.id;
    details.status = contractData.status;
    details.valorPrincipal = contractData.amount;
    details.valorFinal = contractData.finalAmount;
    details.dataPrincipal = contractData.dateCreated;
    details.dataFinal = contractData.endContractDate;
    details.rendimentoAtual = contractData.currentIncome;
    details.rendimentoTotal = contractData.totalIncome;
    details.percentualGanho = contractData.gainPercentage;

    const totalARender = details.valorFinal - details.valorPrincipal;
    progressInfo = {
      title: "Progresso do Rendimento",
      currentValue: details.rendimentoAtual,
      maxValue: totalARender > 0 ? totalARender : 1,
      currentLabel: (
        <>
          Rendimento Atual:{" "}
          <strong>{formatCurrency(details.rendimentoAtual)}</strong>
        </>
      ),
      maxLabel: (
        <>
          Meta: <strong>{formatCurrency(totalARender)}</strong>
        </>
      ),
    };
  } else {
    const { contract, totalIncome, avaliableToWithdraw, totalWithdrawn } =
      contractData;
    details.id = contract.id;
    details.status = contract.status;
    details.valorPrincipal = contract.totalPrice;
    details.dataPrincipal = contract.dateCreated;
    details.dataPrimeiraValorizacao = contract.firstValorization;
    details.dataFinal = contract.endContractDate;
    details.rendimentoTotal = totalIncome;
    details.disponivelSaque = avaliableToWithdraw;
    details.totalSacado = totalWithdrawn;
    details.valorizacaoAtual = contract.actualValorization;
    details.valorizacaoMaxima = contract.maxValorization;
    details.withdrawDates = contract.withdrawDates || [];

    progressInfo = {
      title: "Progresso da Valorização",
      currentValue: details.valorizacaoAtual,
      maxValue: details.valorizacaoMaxima,
      currentLabel: (
        <>
          Valorização Atual:{" "}
          <strong>{details.valorizacaoAtual.toFixed(2)}%</strong>
        </>
      ),
      maxLabel: (
        <>
          Meta: <strong>{details.valorizacaoMaxima}%</strong>
        </>
      ),
    };
  }

  const getNextWithdrawDate = () => {
    if (!details.withdrawDates || details.withdrawDates.length === 0)
      return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcoming = details.withdrawDates
      .map((d) => new Date(d))
      .filter((d) => {
        const checkDate = new Date(d);
        checkDate.setHours(0, 0, 0, 0);
        return checkDate >= today;
      })
      .sort((a, b) => a - b);

    return upcoming.length > 0 ? upcoming[0] : null;
  };

  const nextDate = getNextWithdrawDate();
  const isToday =
    nextDate && nextDate.toDateString() === new Date().toDateString();

  const getDateStatusClass = (dateString) => {
    const date = new Date(dateString);
    date.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (date.getTime() === today.getTime()) return "date-today";
    if (date.getTime() < today.getTime()) return "date-past";
    return "date-future";
  };

  return (
    <motion.div
      className="contract-detail-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <button onClick={() => navigate(-1)} className="back-button">
        <i className="fa-solid fa-arrow-left"></i> Voltar
      </button>

      <div className="contract-header card-base">
        <div>
          <h1>Detalhes do Contrato #{details.id}</h1>
          <p>
            Pertencente a <strong>{clientName || "Cliente"}</strong>
          </p>
        </div>
        {getStatusBadge(details.status, platformId)}
      </div>

      <UniversalProgressBar progressInfo={progressInfo} />

      <div className="details-grid">
        <div className="metric-card card-base">
          <span>{isDiamond ? "Valor Aplicado" : "Valor do Contrato"}</span>
          <strong>{formatCurrency(details.valorPrincipal)}</strong>
        </div>
        <div className="metric-card card-base">
          <span>Rendimento Total</span>
          <strong>{formatCurrency(details.rendimentoTotal)}</strong>
        </div>

        {isDiamond ? (
          <>
            <div className="metric-card card-base">
              <span>Valor Final</span>
              <strong>{formatCurrency(details.valorFinal)}</strong>
            </div>
            <div className="metric-card card-base">
              <span>Ganho</span>
              <strong>{details.percentualGanho}%</strong>
            </div>
          </>
        ) : (
          <>
            <div className="metric-card card-base">
              <span>Disponível p/ Saque</span>
              <strong className="valor-disponivel">
                {formatCurrency(details.disponivelSaque)}
              </strong>
            </div>
            <div className="metric-card card-base">
              <span>Total Sacado</span>
              <strong>{formatCurrency(details.totalSacado)}</strong>
            </div>
          </>
        )}

        <div className="metric-card card-base">
          <span>Data de Início</span>
          <strong>{formatDate(details.dataPrincipal)}</strong>
        </div>

        {!isDiamond && (
          <div className="metric-card card-base highlight-withdraw">
            <span>Primeira Valorização</span>
            <strong>{formatDate(details.dataPrimeiraValorizacao)}</strong>
            {details.dataPrimeiraValorizacao && (
              <div className="next-withdraw-info">
                <small>Próximo Saque:</small>
                {nextDate ? (
                  <span className={isToday ? "today-label" : ""}>
                    {isToday ? "HOJE" : formatDate(nextDate)}
                  </span>
                ) : (
                  <span>Finalizado</span>
                )}
                <button
                  className="view-all-dates"
                  onClick={() => setShowModal(true)}
                >
                  Ver todas
                </button>
              </div>
            )}
          </div>
        )}

        <div className="metric-card card-base">
          <span>Data Final</span>
          <strong>{formatDate(details.dataFinal)}</strong>
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <motion.div
              className="modal-content card-base"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <div className="modal-header">
                <h2>Cronograma de Saques</h2>
                <button
                  className="close-modal"
                  onClick={() => setShowModal(false)}
                >
                  &times;
                </button>
              </div>
              <div className="withdraw-list">
                {details.withdrawDates.map((date, index) => (
                  <div
                    key={index}
                    className={`withdraw-item ${getDateStatusClass(date)}`}
                  >
                    <div className="withdraw-info">
                      <span className="withdraw-index">
                        {index + 1}º Período
                      </span>
                      <span className="withdraw-date">{formatDate(date)}</span>
                    </div>
                    <div className="status-indicator"></div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ContractDetailPage;
