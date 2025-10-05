import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import clientService from "../../../dbServices/clientService";
import "./ClientDetailPage.css";

// --- (Funções auxiliares como formatDate, formatCurrency, etc. permanecem as mesmas) ---
const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString("pt-BR", options);
};
const formatCurrency = (value) => `R$${(typeof value === 'number' ? value : 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const getStatusBadge = (status, platform) => {
    const isDiamond = platform === "DIAMOND_PRIME";
    const statusMap = isDiamond 
        ? { 1: { text: "Ativo", className: "status-active" }, 2: { text: "Finalizado", className: "status-default" } }
        : { 1: { text: "Ativo", className: "status-active" }, 3: { text: "Cancelado", className: "status-canceled" } };
    const { text, className } = statusMap[status] || { text: `Status ${status}`, className: "status-default" };
    return <span className={`status-badge ${className}`}>{text}</span>;
};
const getClientStatus = (status) => status === 1 ? 'Ativo' : 'Inativo';


// --- Componente de Tabela com Navegação ---
const UniversalContractsTable = ({ contracts, platformId, onContractClick }) => {
    const isDiamond = platformId === "DIAMOND_PRIME";

    return (
        <motion.table key="contracts" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>{isDiamond ? 'Valor Aplicado' : 'Valor do Contrato'}</th>
                    <th>Status</th>
                    {isDiamond ? <th>Valor Final</th> : <th>Disponível Saque</th>}
                    {isDiamond ? <th>Data da Aplicação</th> : <th>Data Final</th>}
                </tr>
            </thead>
            <tbody>
                {contracts && contracts.length > 0 ? (
                    contracts
                        .filter(item => item && (isDiamond ? item.id : item.contract?.id))
                        .map(item => (
                            <tr key={isDiamond ? item.id : item.contract.id} onClick={() => onContractClick(item)} className="clickable-row">
                                {isDiamond ? (
                                    <>
                                        <td>#{item.id}</td>
                                        <td>{formatCurrency(item.amount)}</td>
                                        <td>{getStatusBadge(item.status, platformId)}</td>
                                        <td>{formatCurrency(item.finalAmount)}</td>
                                        <td>{formatDate(item.dateCreated)}</td>
                                    </>
                                ) : (
                                    <>
                                        <td>#{item.contract.id}</td>
                                        <td>{formatCurrency(item.contract.totalPrice)}</td>
                                        <td>{getStatusBadge(item.contract.status, platformId)}</td>
                                        <td className="valor-disponivel">{formatCurrency(item.avaliableToWithdraw)}</td>
                                        <td>{formatDate(item.contract.endContractDate)}</td>
                                    </>
                                )}
                            </tr>
                        ))
                ) : (
                    <tr><td colSpan="5" className="empty-message">Nenhum contrato encontrado.</td></tr>
                )}
            </tbody>
        </motion.table>
    );
};

const WithdrawsTable = ({ withdraws }) => (
    // ... (sem alterações aqui)
    <motion.table key="withdraws" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <thead><tr><th>ID</th><th>Valor Sacado</th><th>Status</th><th>Data</th></tr></thead>
        <tbody>
            {withdraws && withdraws.length > 0 ? (
                withdraws.map(w => <tr key={w.id}><td>#{w.id}</td><td>{formatCurrency(w.amountWithdrawn)}</td><td>{getStatusBadge(w.status)}</td><td>{formatDate(w.dateCreated)}</td></tr>)
            ) : (
                <tr><td colSpan="4" className="empty-message">Nenhum saque realizado.</td></tr>
            )}
        </tbody>
    </motion.table>
);


// --- Componente Principal ---
const ClientDetailPage = () => {
  const { cpfCnpj } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [clientData, setClientData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState('contracts');

  useEffect(() => {
    // ... (lógica de fetch permanece a mesma)
    const fetchClientDetails = async () => {
        const platformId = location.state?.platformId;
        if (!cpfCnpj || !platformId) { setError("Informações cruciais não encontradas."); setIsLoading(false); return; }
        setIsLoading(true);
        try {
            const data = await clientService.getClientDetails(platformId, cpfCnpj);
            setClientData(data);
        } catch (err) {
            setError("Não foi possível carregar os dados.");
        } finally {
            setIsLoading(false);
        }
    };
    fetchClientDetails();
  }, [cpfCnpj, location.state]);

  // --- NOVA FUNÇÃO DE NAVEGAÇÃO ---
  const handleContractClick = (contractData) => {
    const contractId = clientData.clientInfo.platformId === 'DIAMOND_PRIME' ? contractData.id : contractData.contract.id;
    navigate(`/platform/contrato/${contractId}`, { 
        state: { 
            contractData, 
            platformId: clientData.clientInfo.platformId,
            clientName: clientData.clientInfo.name // Passando o nome do cliente
        } 
    });
  };

  if (isLoading) return <div className="client-detail-loading">Carregando detalhes do cliente...</div>;
  if (error) return <div className="client-detail-page"><div className="client-detail-error">{error}</div></div>;
  if (!clientData || !clientData.clientInfo) return null;

  const { clientInfo } = clientData;
  const contracts = clientData.contracts || [];
  const withdraws = clientData.withdraws || [];
  const isDiamond = clientInfo.platformId === "DIAMOND_PRIME";

  const totalInvestido = isDiamond ? contracts.reduce((s, i) => s + (i.amount || 0), 0) : contracts.reduce((s, i) => s + (i.contract?.totalPrice || 0), 0);
  const totalDisponivel = isDiamond ? (clientInfo.balance || 0) : contracts.reduce((s, i) => s + (i.avaliableToWithdraw || 0), 0);
  const totalSacado = withdraws.reduce((s, i) => s + (i.amountWithdrawn || 0), 0);

  return (
    <motion.div className="client-detail-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {/* ... (resto do JSX como cabeçalho, resumo, etc. permanece igual) ... */}
        <motion.button onClick={() => navigate('/platform/clientes')} className="back-button"><i className="fa-solid fa-arrow-left"></i> Voltar</motion.button>
        <motion.div className="client-header card-base">
            <div className="client-info"><h1>{clientInfo.name}</h1><p>{clientInfo.email}</p></div>
            <div className={`client-status-tag status-${getClientStatus(clientInfo.status).toLowerCase()}`}>{getClientStatus(clientInfo.status)}</div>
        </motion.div>
        <motion.div className="details-grid">
            <div className="details-card card-base">
                <h3><i className="fa-solid fa-user-check"></i> Informações Pessoais</h3>
                <ul><li><span>CPF/CNPJ</span> <strong>{clientInfo.cpfCnpj}</strong></li><li><span>Telefone(s)</span> <strong>{clientInfo.phoneNumber || 'N/A'}</strong></li><li><span>Cliente Desde</span> <strong>{formatDate(clientInfo.dateCreated)}</strong></li></ul>
            </div>
            <div className="details-card card-base">
                <h3><i className="fa-solid fa-chart-pie"></i> Resumo Financeiro</h3>
                <ul><li><span>{isDiamond ? 'Total Aplicado' : 'Total Investido'}</span> <strong className="valor-neutro">{formatCurrency(totalInvestido)}</strong></li><li><span>Total Sacado</span> <strong className="valor-negativo">{formatCurrency(totalSacado)}</strong></li><li><span>{isDiamond ? 'Saldo em Conta' : 'Disponível p/ Saque'}</span> <strong className="valor-disponivel">{formatCurrency(totalDisponivel)}</strong></li></ul>
            </div>
        </motion.div>

      <motion.div className="data-table-container card-base">
        <div className="table-tabs">{/* ... (abas) ... */}
            <button className={`tab-button ${activeTab === 'contracts' ? 'active' : ''}`} onClick={() => setActiveTab('contracts')}><i className="fa-solid fa-file-signature"></i> Contratos ({contracts.length})</button>
            <button className={`tab-button ${activeTab === 'withdraws' ? 'active' : ''}`} onClick={() => setActiveTab('withdraws')}><i className="fa-solid fa-money-bill-transfer"></i> Saques ({withdraws.length})</button>
        </div>
        <div className="table-content">
            <AnimatePresence mode="wait">
                {activeTab === 'contracts'
                    ? <UniversalContractsTable contracts={contracts} platformId={clientInfo.platformId} onContractClick={handleContractClick} />
                    : <WithdrawsTable withdraws={withdraws} />
                }
            </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ClientDetailPage;