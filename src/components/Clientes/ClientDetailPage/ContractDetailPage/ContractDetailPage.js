import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import "./ContractDetailPage.css";

// Mantém a formatação visual correta (usando UTC para exibir a string)
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
        1: { text: "Pendente", className: "status-pending" },
        2: { text: "Ativo", className: "status-active" },
        3: { text: "Cancelado", className: "status-canceled" },
        4: { text: "Finalizado", className: "status-completed" },
      }
    : {
        1: { text: "Valorizando", className: "status-active" },
        2: { text: "Valorização Concluída", className: "status-completed" },
        3: { text: "Cancelado", className: "status-canceled" },
        4: { text: "Pendente", className: "status-pending" },
        5: { text: "Recomprado", className: "status-default" },
      };
  const { text, className } = statusMap[status] || {
    text: `Status ${status}`,
    className: "status-default",
  };
  return <span className={`status-badge ${className}`}>{text}</span>;
};

// Status de saque (mesma semântica do portal do cliente do CPOM)
const WITHDRAW_STATUS_LABELS = {
  1: "Pendente",
  2: "Pago",
  3: "Cancelado",
  4: "Ctr. Recomprado",
};

const WITHDRAW_STATUS_CLASSES = {
  1: "status-pending",
  2: "status-completed",
  3: "status-canceled",
  4: "status-default",
};

const getWithdrawStatusBadge = (status) => (
  <span
    className={`status-badge ${
      WITHDRAW_STATUS_CLASSES[status] || "status-default"
    }`}
  >
    {WITHDRAW_STATUS_LABELS[status] || `Status ${status}`}
  </span>
);

// Tipo do saque — mesma regra do portal do cliente do CPOM
const getWithdrawTypeTag = (w) => {
  const desc = (w.description || "").toLowerCase();
  if (w.sponsorWithdraw) {
    return (
      <span className="withdraw-type-tag type-indicacao">
        <i className="fa-solid fa-user-plus"></i> Indicação
      </span>
    );
  }
  if (desc.includes("golden box") || desc.includes("caixinha")) {
    return (
      <span className="withdraw-type-tag type-goldenbox">
        <i className="fa-solid fa-box"></i> Golden Box
      </span>
    );
  }
  if (desc.includes("recompra")) {
    return (
      <span className="withdraw-type-tag type-recompra">
        <i className="fa-solid fa-rotate"></i> Recompra
      </span>
    );
  }
  return <span className="withdraw-type-tag type-comum">Saque</span>;
};

// Texto de descrição idêntico ao do portal do cliente do CPOM
const getWithdrawDescription = (w) => {
  const valor = formatCurrency(w.amountWithdrawn);
  const desc = (w.description || "").toLowerCase();
  if (w.sponsorWithdraw) return `Saque de Indicação de ${valor}`;
  if (desc.includes("golden box") || desc.includes("caixinha"))
    return `Transferência para Golden Box de ${valor}`;
  if (desc.includes("recompra")) return `Saque para Recompra de ${valor}`;
  return `Saque de ${valor}`;
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
  const [withdrawStatusFilter, setWithdrawStatusFilter] = useState("all");
  const [withdrawsPage, setWithdrawsPage] = useState(1);
  const WITHDRAWS_PER_PAGE = 5;

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

  // --- CORREÇÃO DE FUSO HORÁRIO ---
  
  // Função auxiliar: Converte a string UTC para um objeto Date LOCAL, 
  // mas mantendo os números do dia/mês/ano originais.
  // Ex: "2023-10-24T00:00Z" vira "24/10/2023 00:00" no horário do navegador.
  const parseDateAsLocal = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;
    return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  };

  const getNextWithdrawDate = () => {
    if (!details.withdrawDates || details.withdrawDates.length === 0)
      return null;
    
    // Hoje zerado (00:00:00)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcoming = details.withdrawDates
      .map((d) => parseDateAsLocal(d)) // Usa a conversão segura
      .filter((d) => {
        if(!d) return false;
        // Compara data local com data local (sem fuso interferindo)
        return d >= today; 
      })
      .sort((a, b) => a - b);

    return upcoming.length > 0 ? upcoming[0] : null;
  };

  const nextDate = getNextWithdrawDate();
  
  // Verifica se é hoje (comparando strings de data local)
  const isToday =
    nextDate && nextDate.toDateString() === new Date().toDateString();

  const getDateStatusClass = (dateString) => {
    const date = parseDateAsLocal(dateString); // Usa a conversão segura
    if(!date) return "";

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (date.getTime() === today.getTime()) return "date-today";
    if (date.getTime() < today.getTime()) return "date-past";
    return "date-future";
  };
  // --- FIM DA CORREÇÃO ---

  // --- SAQUES DO CONTRATO (somente CPOM; a Diamond não vincula saque a contrato) ---
  const contractWithdraws = data.contractWithdraws || [];

  const withdrawStatusCounts = contractWithdraws.reduce((acc, w) => {
    if (w.status == null) return acc;
    acc[w.status] = (acc[w.status] || 0) + 1;
    return acc;
  }, {});

  const visibleWithdraws =
    withdrawStatusFilter === "all"
      ? contractWithdraws
      : contractWithdraws.filter((w) => w.status === withdrawStatusFilter);

  const totalWithdrawPages = Math.ceil(
    visibleWithdraws.length / WITHDRAWS_PER_PAGE
  );
  const paginatedWithdraws = visibleWithdraws.slice(
    (withdrawsPage - 1) * WITHDRAWS_PER_PAGE,
    withdrawsPage * WITHDRAWS_PER_PAGE
  );

  const handleWithdrawFilterChange = (status) => {
    setWithdrawStatusFilter(status);
    setWithdrawsPage(1);
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

      {/* --- TABELA DE SAQUES DO CONTRATO (CPOM) --- */}
      {!isDiamond && (
        <div className="contract-withdraws-section card-base">
          <div className="contract-withdraws-header">
            <h3>
              <i className="fa-solid fa-money-bill-transfer"></i> Saques deste
              Contrato ({contractWithdraws.length})
            </h3>
          </div>

          {contractWithdraws.length > 0 && (
            <div className="status-filter-chips">
              <button
                className={
                  withdrawStatusFilter === "all" ? "chip active" : "chip"
                }
                onClick={() => handleWithdrawFilterChange("all")}
              >
                Todos ({contractWithdraws.length})
              </button>
              {Object.keys(withdrawStatusCounts)
                .map(Number)
                .sort((a, b) => a - b)
                .map((s) => (
                  <button
                    key={s}
                    className={
                      withdrawStatusFilter === s ? "chip active" : "chip"
                    }
                    onClick={() => handleWithdrawFilterChange(s)}
                  >
                    {WITHDRAW_STATUS_LABELS[s] || `Status ${s}`} (
                    {withdrawStatusCounts[s]})
                  </button>
                ))}
            </div>
          )}

          <div className="contract-withdraws-table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tipo</th>
                  <th>Descrição</th>
                  <th>Valor Sacado</th>
                  <th>Status</th>
                  <th>Data</th>
                </tr>
              </thead>
              <tbody>
                {paginatedWithdraws.length > 0 ? (
                  paginatedWithdraws.map((w) => (
                    <tr key={w.id}>
                      <td>#{w.id}</td>
                      <td>{getWithdrawTypeTag(w)}</td>
                      <td className="withdraw-description">
                        {getWithdrawDescription(w)}
                      </td>
                      <td>{formatCurrency(w.amountWithdrawn)}</td>
                      <td>{getWithdrawStatusBadge(w.status)}</td>
                      <td>{formatDate(w.dateCreated)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="empty-message">
                      {contractWithdraws.length === 0
                        ? "Nenhum saque realizado neste contrato."
                        : "Nenhum saque com esse status."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalWithdrawPages > 1 && (
            <div className="contract-withdraws-pagination">
              <button
                disabled={withdrawsPage === 1}
                onClick={() => setWithdrawsPage((p) => p - 1)}
              >
                Anterior
              </button>
              <span>
                Página {withdrawsPage} de {totalWithdrawPages}
              </span>
              <button
                disabled={withdrawsPage === totalWithdrawPages}
                onClick={() => setWithdrawsPage((p) => p + 1)}
              >
                Próxima
              </button>
            </div>
          )}
        </div>
      )}

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