import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import clientService from "../../../dbServices/clientService";
import "./ClientDetailPage.css";

// --- Funções Auxiliares ---
const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString("pt-BR", options);
};
const formatCurrency = (value) => `R$${(typeof value === 'number' ? value : 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// ======================= INÍCIO DA ALTERAÇÃO =======================
const getStatusBadge = (status, platform) => {
    const isDiamond = platform === "DIAMOND_PRIME";
    // O status 2 para CONTRATO na Diamond continua como "Finalizado"
    // Adicionamos o status 2 como "Pendente" para o caso geral (Saques e Vendas)
    const statusMap = isDiamond 
        ? { 
            1: { text: "Ativo", className: "status-active" }, 
            2: { text: "Finalizado", className: "status-default" } 
          }
        : { 
            1: { text: "Ativo", className: "status-active" }, 
            2: { text: "Pendente", className: "status-pending" }, // Adicionado Status 2 para Vendas/Saques
            3: { text: "Cancelado", className: "status-canceled" },
            4: { text: "Pendente", className: "status-pending" }
          };
    const { text, className } = statusMap[status] || { text: `Status ${status}`, className: "status-default" };
    return <span className={`status-badge ${className}`}>{text}</span>;
};
// ======================= FIM DA ALTERAÇÃO =======================

const getClientStatus = (status) => status === 1 ? 'Ativo' : 'Inativo';


// --- Componente de Paginação ---
const Pagination = ({ totalItems, itemsPerPage, currentPage, onPageChange }) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    if (totalPages <= 1) return null;
    return (
        <div className="pagination-controls">
            <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>Anterior</button>
            <span>Página {currentPage} de {totalPages}</span>
            <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>Próxima</button>
        </div>
    );
};

// --- Componentes de Tabela ---
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
                    contracts.map(item => (
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

// Na tabela de saques, o 'platform' não é passado, então o status 2 cairá corretamente em "Pendente"
const WithdrawsTable = ({ withdraws }) => (
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

    const [contractsPage, setContractsPage] = useState(1);
    const [withdrawsPage, setWithdrawsPage] = useState(1);
    const ITEMS_PER_PAGE = 5;

    useEffect(() => {
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

    useEffect(() => {
        setContractsPage(1);
        setWithdrawsPage(1);
    }, [activeTab]);

    const allContracts = useMemo(() => {
        if (!clientData?.contracts) return [];
        const platformId = clientData.clientInfo?.platformId;
        return (clientData.contracts || []).filter(item => item && (platformId === "DIAMOND_PRIME" ? item.id : item.contract?.id));
    }, [clientData]);

    const allWithdraws = useMemo(() => clientData?.withdraws || [], [clientData]);

    const paginatedContracts = useMemo(() => {
        const startIndex = (contractsPage - 1) * ITEMS_PER_PAGE;
        return allContracts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [allContracts, contractsPage]);

    const paginatedWithdraws = useMemo(() => {
        const startIndex = (withdrawsPage - 1) * ITEMS_PER_PAGE;
        return allWithdraws.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [allWithdraws, withdrawsPage]);

    const handleContractClick = (contractData) => {
        if (!clientData?.clientInfo) return;
        const contractId = clientData.clientInfo.platformId === 'DIAMOND_PRIME' ? contractData.id : contractData.contract.id;
        navigate(`/platform/contrato/${contractId}`, { 
            state: { contractData, platformId: clientData.clientInfo.platformId, clientName: clientData.clientInfo.name } 
        });
    };

    if (isLoading) return <div className="client-detail-loading">Carregando detalhes do cliente...</div>;
    if (error) return <div className="client-detail-page"><div className="client-detail-error">{error}</div></div>;
    if (!clientData || !clientData.clientInfo) return null;

    const { clientInfo } = clientData;
    const isDiamond = clientInfo.platformId === "DIAMOND_PRIME";
    
    const totalInvestido = isDiamond ? allContracts.reduce((s, i) => s + (i.amount || 0), 0) : allContracts.reduce((s, i) => s + (i.contract?.totalPrice || 0), 0);
    const totalDisponivel = isDiamond ? (clientInfo.balance || 0) : allContracts.reduce((s, i) => s + (i.avaliableToWithdraw || 0), 0);
    const totalSacado = allWithdraws.reduce((s, i) => s + (i.amountWithdrawn || 0), 0);

    return (
        <motion.div className="client-detail-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
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
                <div className="table-tabs">
                    <button className={`tab-button ${activeTab === 'contracts' ? 'active' : ''}`} onClick={() => setActiveTab('contracts')}><i className="fa-solid fa-file-signature"></i> Contratos ({allContracts.length})</button>
                    <button className={`tab-button ${activeTab === 'withdraws' ? 'active' : ''}`} onClick={() => setActiveTab('withdraws')}><i className="fa-solid fa-money-bill-transfer"></i> Saques ({allWithdraws.length})</button>
                </div>
                <div className="table-content">
                    <AnimatePresence mode="wait">
                        {activeTab === 'contracts'
                            ? <UniversalContractsTable contracts={paginatedContracts} platformId={clientInfo.platformId} onContractClick={handleContractClick} />
                            : <WithdrawsTable withdraws={paginatedWithdraws} />
                        }
                    </AnimatePresence>
                </div>
                {activeTab === 'contracts' && (
                    <Pagination totalItems={allContracts.length} itemsPerPage={ITEMS_PER_PAGE} currentPage={contractsPage} onPageChange={setContractsPage} />
                )}
                {activeTab === 'withdraws' && (
                    <Pagination totalItems={allWithdraws.length} itemsPerPage={ITEMS_PER_PAGE} currentPage={withdrawsPage} onPageChange={setWithdrawsPage} />
                )}
            </motion.div>
        </motion.div>
    );
};

export default ClientDetailPage;