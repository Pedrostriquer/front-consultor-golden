import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './ContractDetailPage.css';

// --- Funções Auxiliares ---
const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString("pt-BR", options);
};
const formatCurrency = (value) => `R$${(typeof value === 'number' ? value : 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const getStatusBadge = (status, platform) => {
    const isDiamond = String(platform).toUpperCase() === 'DIAMOND_PRIME' || String(platform) === '2';
    const statusMap = isDiamond 
        ? { 1: { text: "Ativo", className: "status-active" }, 2: { text: "Finalizado", className: "status-default" } }
        : { 1: { text: "Ativo", className: "status-active" }, 3: { text: "Cancelado", className: "status-canceled" } };
    const { text, className } = statusMap[status] || { text: `Status ${status}`, className: "status-default" };
    return <span className={`status-badge ${className}`}>{text}</span>;
};

// --- Barra de Progresso Universal ---
const UniversalProgressBar = ({ progressInfo }) => {
    const { currentValue, maxValue, currentLabel, maxLabel, title } = progressInfo;
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

// --- Componente Principal ---
const ContractDetailPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [data] = useState(location.state || {});

    useEffect(() => {
        if (!data.contractData) {
            navigate('/platform/clientes'); 
        }
    }, [data, navigate]);

    if (!data.contractData) {
        return <div className="contract-detail-page">Carregando...</div>;
    }
    
    const { contractData, platformId, clientName } = data;
    const isDiamond = String(platformId).toUpperCase() === 'DIAMOND_PRIME' || String(platformId) === '2';

    // --- LÓGICA DE EXTRAÇÃO E PREPARAÇÃO DOS DADOS ---
    const details = {};
    let progressInfo = {};

    if (isDiamond) {
        details.id = contractData.id;
        details.status = contractData.status;
        details.valorPrincipal = contractData.amount;
        details.valorFinal = contractData.finalAmount;
        details.dataPrincipal = contractData.dateCreated;
        details.dataFinal = contractData.endContractDate; // Novo campo
        details.rendimentoAtual = contractData.currentIncome; // Novo campo para progresso
        details.rendimentoTotal = contractData.totalIncome;
        details.percentualGanho = contractData.gainPercentage;

        // Prepara dados para a barra de progresso da Diamond (baseada em R$)
        const totalARender = details.valorFinal - details.valorPrincipal;
        progressInfo = {
            title: 'Progresso do Rendimento',
            currentValue: details.rendimentoAtual,
            maxValue: totalARender > 0 ? totalARender : 1, // Evita divisão por zero
            currentLabel: <>Rendimento Atual: <strong>{formatCurrency(details.rendimentoAtual)}</strong></>,
            maxLabel: <>Meta: <strong>{formatCurrency(totalARender)}</strong></>
        };

    } else {
        if (!contractData.contract) {
            return <div className="contract-detail-page client-detail-error">Estrutura de dados inválida.</div>;
        }
        const { contract, totalIncome, avaliableToWithdraw, totalWithdrawn } = contractData;
        details.id = contract.id;
        details.status = contract.status;
        details.valorPrincipal = contract.totalPrice;
        details.dataPrincipal = contract.dateCreated;
        details.dataFinal = contract.endContractDate;
        details.rendimentoTotal = totalIncome;
        details.disponivelSaque = avaliableToWithdraw;
        details.totalSacado = totalWithdrawn;
        details.valorizacaoAtual = contract.actualValorization;
        details.valorizacaoMaxima = contract.maxValorization;

        // Prepara dados para a barra de progresso da Golden (baseada em %)
        progressInfo = {
            title: 'Progresso da Valorização',
            currentValue: details.valorizacaoAtual,
            maxValue: details.valorizacaoMaxima,
            currentLabel: <>Valorização Atual: <strong>{details.valorizacaoAtual.toFixed(2)}%</strong></>,
            maxLabel: <>Meta: <strong>{details.valorizacaoMaxima}%</strong></>
        };
    }

    const pageVariants = {
        initial: { opacity: 0, y: 20 },
        in: { opacity: 1, y: 0, transition: { staggerChildren: 0.1, duration: 0.5 } },
    };

    return (
        <motion.div className="contract-detail-page" variants={pageVariants} initial="initial" animate="in">
            <button onClick={() => navigate(-1)} className="back-button">
                <i className="fa-solid fa-arrow-left"></i> Voltar
            </button>

            <div className="contract-header card-base">
                <div>
                    <h1>Detalhes do Contrato #{details.id}</h1>
                    <p>Pertencente a <strong>{clientName || 'Cliente'}</strong></p>
                </div>
                {getStatusBadge(details.status, platformId)}
            </div>
            
            <UniversalProgressBar progressInfo={progressInfo} />

            <div className="details-grid">
                <div className="metric-card card-base"><span>{isDiamond ? 'Valor Aplicado' : 'Valor do Contrato'}</span><strong>{formatCurrency(details.valorPrincipal)}</strong></div>
                <div className="metric-card card-base"><span>Rendimento Total</span><strong>{formatCurrency(details.rendimentoTotal)}</strong></div>
                {isDiamond ? (
                    <>
                        <div className="metric-card card-base"><span>Valor Final</span><strong>{formatCurrency(details.valorFinal)}</strong></div>
                        <div className="metric-card card-base"><span>Ganho</span><strong>{details.percentualGanho}%</strong></div>
                    </>
                ) : (
                    <>
                        <div className="metric-card card-base"><span>Disponível p/ Saque</span><strong className="valor-disponivel">{formatCurrency(details.disponivelSaque)}</strong></div>
                        <div className="metric-card card-base"><span>Total Sacado</span><strong>{formatCurrency(details.totalSacado)}</strong></div>
                    </>
                )}
                <div className="metric-card card-base"><span>Data de Início</span><strong>{formatDate(details.dataPrincipal)}</strong></div>
                <div className="metric-card card-base"><span>Data Final</span><strong>{formatDate(details.dataFinal)}</strong></div>
            </div>
        </motion.div>
    );
};

export default ContractDetailPage;