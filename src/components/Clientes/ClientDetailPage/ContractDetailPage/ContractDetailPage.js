import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import CountUp from "react-countup";
import consultantService from "../../../../dbServices/consultantService";
import "./ContractDetailPage.css";

// Funções auxiliares (sem alteração)
const formatCurrency = (value) => {
  if (value === null || value === undefined) return "R$ 0,00";
  return `R$${value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("pt-BR");
};

// Badges de Status (sem alteração)
const getStatusBadge = (status, type = 'contract') => {
    const statusMap = {
        contract: {
            1: { text: "Pendente", className: "status-pending" },
            2: { text: "Valorizando", className: "status-active" },
            3: { text: "Cancelado", className: "status-canceled" },
            4: { text: "Concluído", className: "status-completed" },
        },
        commission: {
            1: { text: "Pendente", className: "status-pending" },
            2: { text: "Recebida", className: "status-completed" },
            3: { text: "Cancelada", className: "status-canceled" }
        }
    };
    const { text, className } = statusMap[type]?.[status] || { text: "Desconhecido", className: ""};
    return <span className={`status-badge ${className}`}>{text}</span>;
};

const ContractDetailPage = () => {
  const { clientId, contractId } = useParams();
  const [contract, setContract] = useState(null);
  const [error, setError] = useState("");
  const [lightboxImage, setLightboxImage] = useState(null);

  useEffect(() => {
    const fetchContract = async () => {
      try {
        const response = await consultantService.getContractDetails(clientId, contractId);
        setContract(response.data);
      } catch (err) {
        setError("Contrato não encontrado ou você não tem permissão para vê-lo.");
      } 
    };
    fetchContract();
  }, [clientId, contractId]);

  // Animações (sem alteração)
  const pageVariants = {
    initial: { opacity: 0 },
    in: { opacity: 1, transition: { staggerChildren: 0.1, duration: 0.3 } },
    out: { opacity: 0 }
  };
  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
  };

  if (error) return <div className="contract-detail-page error-message">{error}</div>;
  if (!contract) return null;

  const rendimentoTotalEsperado = contract.finalAmount - contract.amount;
  const progress = Math.min(100, (contract.currentIncome / rendimentoTotalEsperado) * 100 || 0);

  return (
    <motion.div className="contract-detail-page" variants={pageVariants} initial="initial" animate="in" exit="out">
        <motion.div className="contract-page-header" variants={itemVariants}>
            <Link to={`/platform/clientes/${clientId}`} className="back-button">
            <i className="fa-solid fa-arrow-left"></i> Voltar para {contract.clientName}
            </Link>
        </motion.div>

        <motion.div className="contract-hero card-base" variants={itemVariants}>
            <div className="hero-header">
            <div>
                <h1 className="contract-title">Contrato #{contract.id}</h1>
                <p className="client-link">Cliente: {contract.clientName}</p>
            </div>
            <div className="contract-status-box">
                <span>Status</span>
                {getStatusBadge(contract.status, 'contract')}
            </div>
            </div>
            <div className="progress-section">
            <div className="progress-info">
                <span className="progress-label">Progresso de Rendimento</span>
                <span className="progress-values">
                {formatCurrency(contract.currentIncome)} / <strong>{formatCurrency(rendimentoTotalEsperado)}</strong>
                </span>
            </div>
            <div className="progress-bar-container">
                <motion.div
                className="progress-bar-fill"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                />
            </div>
            <div className="progress-percentage">
                <CountUp end={progress} duration={1.5} decimals={2} suffix="%" />
            </div>
            </div>
        </motion.div>

        <motion.div className="details-grid" variants={itemVariants}>
            <div className="details-card card-base">
            <h3><i className="fa-solid fa-coins"></i> Valores</h3>
            <ul>
                <li className="detail-item"><span>Valor Investido</span> <strong>{formatCurrency(contract.amount)}</strong></li>
                <li className="detail-item"><span>Rendimento Mensal</span> <strong>{contract.gainPercentage}%</strong></li>
                <li className="detail-item"><span>Valor Final Estimado</span> <strong>{formatCurrency(contract.finalAmount)}</strong></li>
            </ul>
            </div>
            <div className="details-card card-base">
            <h3><i className="fa-solid fa-calendar-days"></i> Datas e Prazos</h3>
            <ul>
                <li className="detail-item"><span>Criação</span> {formatDate(contract.dateCreated)}</li>
                <li className="detail-item"><span>Ativação</span> {formatDate(contract.activationDate)}</li>
                <li className="detail-item"><span>Vencimento</span> {formatDate(contract.endContractDate)}</li>
                <li className="detail-item"><span>Duração</span> {contract.duration} meses</li>
            </ul>
            </div>
            <div className="details-card card-base">
            <h3><i className="fa-solid fa-file-invoice-dollar"></i> Comissão</h3>
            <ul>
                <li className="detail-item">
                <span>Recebeu Comissão?</span>
                <strong className={contract.commissionExists ? 'text-success' : 'text-muted'}>
                    {contract.commissionExists ? "Sim" : "Não"}
                </strong>
                </li>
                <li className="detail-item">
                <span>Valor da Comissão</span>
                <strong>{contract.commissionExists ? formatCurrency(contract.commissionAmount) : "N/A"}</strong>
                </li>
                <li className="detail-item">
                <span>Status da Comissão</span>
                <div>{getStatusBadge(contract.commissionStatus, 'commission')}</div>
                </li>
            </ul>
            </div>
        </motion.div>

        {/* ======================================================= */}
        {/* ====== CARD DE DOCUMENTOS E MÍDIAS FOI REMOVIDO ====== */}
        {/* ======================================================= */}

        <AnimatePresence>
            {lightboxImage && (
            <motion.div className="lightbox-backdrop" onClick={() => setLightboxImage(null)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <motion.img src={lightboxImage} alt="Visualização ampliada" initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }} onClick={(e) => e.stopPropagation()} />
                <button className="lightbox-close" onClick={() => setLightboxImage(null)}>&times;</button>
            </motion.div>
            )}
        </AnimatePresence>
    </motion.div>
  );
};

export default ContractDetailPage;