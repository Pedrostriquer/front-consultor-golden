import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import saleService from "../../../../dbServices/saleService";
import "./ContractDetailPage.css";

// --- Funções Auxiliares ---
const formatCurrency = (value) => `R$${(value || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("pt-BR");
};

const getStatusBadge = (status, type) => {
    const statusText = status ? (typeof status === 'string' ? status.toUpperCase() : status) : 'DESCONHECIDO';
    const statusMap = {
        sale: {
            'PENDENTE': { text: "Pendente", className: "status-pending" },
            'VENDIDO': { text: "Vendido", className: "status-active" },
            'RECEBIDO': { text: "Recebido", className: "status-completed" },
            'CANCELADO': { text: "Cancelado", className: "status-canceled" },
        },
        contract: {
            1: { text: "Ativo", className: "status-active" },
            2: { text: "Finalizado", className: "status-completed" },
            3: { text: "Cancelado", className: "status-canceled" },
            4: { text: "Pendente", className: "status-pending" },
        }
    };
    const { text, className } = statusMap[type]?.[statusText] || { text: statusText, className: ""};
    return <span className={`status-badge ${className}`}>{text}</span>;
};

// --- Componente Principal ---
const ContractDetailPage = () => {
  const { saleId } = useParams(); // Pega o ID da venda do URL
  const navigate = useNavigate();

  const [saleData, setSaleData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSaleDetails = async () => {
        if (!saleId) return;
        setIsLoading(true);
        setError('');
        try {
            const data = await saleService.getSaleById(saleId); // Busca pelo ID da venda
            setSaleData(data);
        } catch(err) {
            console.error("Erro ao buscar detalhes da venda:", err);
            setError("Não foi possível carregar os detalhes da venda.");
        } finally {
            setIsLoading(false);
        }
    };
    fetchSaleDetails();
  }, [saleId]);

  const pageVariants = {
    initial: { opacity: 0 },
    in: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };
  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  if (isLoading) {
    return <div className="contract-detail-loading">A carregar detalhes...</div>;
  }
  if (error) {
    return (
        <div className="contract-detail-page">
            <motion.button onClick={() => navigate(-1)} className="back-button" variants={itemVariants}>
                <i className="fa-solid fa-arrow-left"></i> Voltar
            </motion.button>
            <div className="error-message">{error}</div>
        </div>
    );
  }
  if (!saleData || !saleData.contract || !saleData.client) {
    return <div className="contract-detail-page error-message">Dados da venda incompletos ou não encontrados.</div>;
  }

  const { contract, client } = saleData;

  return (
    <motion.div className="contract-detail-page" variants={pageVariants} initial="initial" animate="in">
        <motion.div className="contract-page-header" variants={itemVariants}>
            <button onClick={() => navigate(-1)} className="back-button">
                <i className="fa-solid fa-arrow-left"></i> Voltar
            </button>
        </motion.div>

        <motion.div className="contract-hero card-base" variants={itemVariants}>
            <div className="hero-header">
                <div>
                    <h1 className="contract-title">Venda #{saleData.id} (Contrato #{contract.id})</h1>
                    <p className="client-link" onClick={() => navigate(`/platform/clientes/${client.cpfCnpj}`)}>
                        Cliente: {client.name}
                    </p>
                </div>
                <div className="contract-status-box">
                    <span>Status da Venda</span>
                    {getStatusBadge(saleData.status, 'sale')}
                </div>
            </div>
        </motion.div>

        <motion.div className="details-grid" variants={itemVariants}>
            <div className="details-card card-base">
                <h3><i className="fa-solid fa-coins"></i> Valores</h3>
                <ul>
                    <li className="detail-item"><span>Valor da Venda</span> <strong>{formatCurrency(saleData.value)}</strong></li>
                    <li className="detail-item"><span>Quantidade de Cotas</span> <strong>{contract.contractQtt}</strong></li>
                    <li className="detail-item"><span>Valor Unitário da Cota</span> <strong>{formatCurrency(contract.contractUniValue)}</strong></li>
                </ul>
            </div>
            <div className="details-card card-base">
                <h3><i className="fa-solid fa-calendar-days"></i> Datas do Contrato</h3>
                <ul>
                    <li className="detail-item"><span>Criação</span> {formatDate(contract.dateCreated)}</li>
                    <li className="detail-item"><span>Vencimento</span> {formatDate(contract.endContractDate)}</li>
                    <li className="detail-item"><span>Duração</span> {contract.duration} meses</li>
                </ul>
            </div>
            <div className="details-card card-base">
                <h3><i className="fa-solid fa-file-invoice"></i> Detalhes do Contrato</h3>
                <ul>
                    <li className="detail-item"><span>Status do Contrato</span> <div>{getStatusBadge(contract.status, 'contract')}</div></li>
                    <li className="detail-item"><span>Método de Pagamento</span> <strong>{contract.payMethod || 'N/A'}</strong></li>
                    <li className="detail-item"><span>Descrição</span> <p>{saleData.description || 'Sem descrição.'}</p></li>
                </ul>
            </div>
        </motion.div>
    </motion.div>
  );
};

export default ContractDetailPage;