import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import saleService from '../../dbServices/saleService';
import './SaleDetailPage.css';

// --- Funções Auxiliares ---
const formatCurrency = (value) => `R$${(value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString("pt-BR", options);
};
const getStatusBadge = (status) => {
    const statusText = String(status).toUpperCase();
    const statusMap = {
      'PENDENTE': { text: "Pendente", className: "status-pending" },
      'VENDIDO': { text: "Vendido", className: "status-active" },
      'RECEBIDO': { text: "Recebido", className: "status-completed" },
      'CANCELADO': { text: "Cancelado", className: "status-canceled" },
    };
    const { text, className } = statusMap[statusText] || { text: statusText, className: "status-default"};
    return <span className={`status-badge ${className}`}>{text}</span>;
};

// --- Componente Principal ---
const SaleDetailPage = () => {
    const { saleId } = useParams();
    const navigate = useNavigate();
    const [sale, setSale] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchSaleDetails = async () => {
            if (!saleId) {
                setError("ID da venda não fornecido.");
                setIsLoading(false);
                return;
            }
            try {
                const data = await saleService.getSaleById(saleId);
                setSale(data);
            } catch (err) {
                console.error(`Erro ao buscar detalhes da venda #${saleId}:`, err);
                setError("Não foi possível carregar os detalhes da venda.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchSaleDetails();
    }, [saleId]);

    if (isLoading) {
        // Você pode criar um componente de Skeleton Loader aqui se desejar
        return <div className="sale-detail-page">Carregando...</div>;
    }

    if (error) {
        return <div className="sale-detail-page sale-detail-error">{error}</div>;
    }

    if (!sale) {
        return null;
    }
    
    // Calcula a comissão baseada na percentagem do consultor
    const commissionValue = sale.value * (sale.consultant?.commissionPercentage / 100);

    const pageVariants = {
        initial: { opacity: 0, y: 20 },
        in: { opacity: 1, y: 0, transition: { staggerChildren: 0.1, duration: 0.5 } },
    };

    return (
        <motion.div className="sale-detail-page" variants={pageVariants} initial="initial" animate="in">
            <button onClick={() => navigate(-1)} className="back-button">
                <i className="fa-solid fa-arrow-left"></i> Voltar para Vendas
            </button>

            <div className="sale-header card-base">
                <div>
                    <h1>Detalhes da Venda #{sale.id}</h1>
                    <p>Realizada em: <strong>{formatDate(sale.dateCreated)}</strong></p>
                </div>
                {getStatusBadge(sale.status)}
            </div>

            <div className="details-grid">
                <div className="details-card card-base">
                    <h3><i className="fa-solid fa-user"></i> Informações do Cliente</h3>
                    <ul>
                        <li><span>Nome</span><strong>{sale.clientName}</strong></li>
                        <li><span>CPF/CNPJ</span><strong>{sale.clientCpfCnpj}</strong></li>
                    </ul>
                </div>
                <div className="details-card card-base">
                    <h3><i className="fa-solid fa-file-invoice-dollar"></i> Valores</h3>
                    <ul>
                        <li><span>Valor da Venda</span><strong className="valor-total">{formatCurrency(sale.value)}</strong></li>
                        <li><span>Sua Comissão ({sale.consultant?.commissionPercentage}%)</span><strong className="valor-comissao">{formatCurrency(commissionValue)}</strong></li>
                    </ul>
                </div>
            </div>

            <div className="description-card card-base">
                <h3><i className="fa-solid fa-clipboard-list"></i> Descrição da Venda</h3>
                <p>{sale.description}</p>
                <span>ID do Contrato de Referência: #{sale.contractId}</span>
            </div>
        </motion.div>
    );
};

export default SaleDetailPage;