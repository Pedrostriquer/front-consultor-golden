import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import CountUp from "react-countup";
import { motion, AnimatePresence } from "framer-motion";
import consultantService from "../../../dbServices/consultantService";
// import LoadingScreen from "../../LoadingScreen/LoadingScreen"; // <<-- 1. IMPORTAÇÃO REMOVIDA
import formatters from "../../../utils/formatters";
import "./ClientDetailPage.css";

const ITEMS_PER_PAGE = 5;

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
    const map = {
        contract: {
            1: { text: "Pendente", className: "status-pending" },
            2: { text: "Valorizando", className: "status-active" },
            3: { text: "Cancelado", className: "status-canceled" },
            4: { text: "Concluído", className: "status-completed" }
        },
        withdraw: {
            1: { text: "Pendente", className: "status-pending" },
            2: { text: "Aprovado", className: "status-completed" },
            3: { text: "Negado", className: "status-canceled" },
            4: { text: "Cancelado", className: "status-canceled" }
        },
        commission: {
            1: { text: "Pendente", className: "status-pending" },
            2: { text: "Recebida", className: "status-completed" },
            3: { text: "Cancelada", className: "status-canceled" }
        }
    };
    const { text, className } = map[type]?.[status] || { text: "Desconhecido", className: ""};
    return <span className={`status-badge ${className}`}>{text}</span>;
};


const ClientDetailPage = () => {
  const { clientId } = useParams();
  const [client, setClient] = useState(null);
  const [allContracts, setAllContracts] = useState([]);
  const [allWithdraws, setAllWithdraws] = useState([]);
  // const [isLoading, setIsLoading] = useState(true); // <<-- 2. ESTADO DE LOADING REMOVIDO
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("contracts");
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  const fetchAllData = useCallback(async () => {
    // setIsLoading(true); // <<-- REMOVIDO
    setError("");
    try {
      const clientPromise = consultantService.getMyClientById(clientId);
      const contractsPromise = consultantService.getClientContracts(clientId);
      const withdrawsPromise = consultantService.getClientWithdraws(clientId);
      const [clientResponse, contractsResponse, withdrawsResponse] =
        await Promise.all([clientPromise, contractsPromise, withdrawsPromise]);
      setClient(clientResponse.data);
      setAllContracts(contractsResponse.data);
      setAllWithdraws(withdrawsResponse.data);
    } catch (err) {
      setError("Cliente não encontrado ou você não tem permissão para vê-lo.");
    } 
    // finally { setIsLoading(false); } // <<-- REMOVIDO
  }, [clientId]);

  useEffect(() => { fetchAllData(); }, [fetchAllData]);

  const handleContactClick = () => {
    const result = formatters.formatPhoneNumberForWhatsapp(client?.phoneNumber);
    if (result.error) {
        alert(result.message);
    } else {
        window.open(result.link, '_blank', 'noopener,noreferrer');
    }
  };
  
  const { paginatedItems, totalPages } = useMemo(() => {
    const sourceData = activeTab === "contracts" ? allContracts : allWithdraws;
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const items = sourceData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    const pages = Math.max(1, Math.ceil(sourceData.length / ITEMS_PER_PAGE));
    return { paginatedItems: items, totalPages: pages };
  }, [allContracts, allWithdraws, currentPage, activeTab]);

  // Animações
  const pageVariants = {
    initial: { opacity: 0 },
    in: { opacity: 1, transition: { staggerChildren: 0.1, duration: 0.3 } },
    out: { opacity: 0 }
  };
  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
  };
  const tabContentVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
    out: { opacity: 0, y: -20, transition: { duration: 0.2, ease: "easeIn" } }
  };

  // if (isLoading) return <LoadingScreen />; // <<-- 3. RENDERIZAÇÃO CONDICIONAL REMOVIDA
  if (error) return <div className="client-detail-page error-message">{error}</div>;
  if (!client) return null; // Retorna nulo enquanto os dados não chegam

  const totalInvestido = allContracts.filter((c) => c.status === 2).reduce((sum, c) => sum + c.amount, 0);
  const totalComissaoPaga = allContracts.filter((c) => c.commissionStatus === 2).reduce((sum, c) => sum + (c.commissionAmount || 0), 0);
  const totalComissaoPendente = allContracts.filter((c) => c.commissionStatus === 1).reduce((sum, c) => sum + (c.commissionAmount || 0), 0);
  
  const getInitials = (name) => (name ? name.charAt(0).toUpperCase() : "");

  return (
    <motion.div className="client-detail-page" variants={pageVariants} initial="initial" animate="in" exit="out">
        {/* ... O resto do seu JSX permanece exatamente o mesmo ... */}
        <motion.div className="client-page-header" variants={itemVariants}>
            <Link to="/platform/clientes" className="back-button">
            <i className="fa-solid fa-arrow-left"></i> Voltar
            </Link>
            <button onClick={handleContactClick} className="whatsapp-button">
            <i className="fa-brands fa-whatsapp"></i> Entrar em contato
            </button>
        </motion.div>

        <motion.div className="client-info-card card-base" variants={itemVariants}>
            <div className="client-avatar">{getInitials(client.name)}</div>
            <div className="client-info-main">
            <h1 className="client-name">{client.name}</h1>
            <p className="client-detail">CPF/CNPJ: {client.cpfCnpj}</p>
            <p className="client-detail">Email: {client.email}</p>
            </div>
        </motion.div>

        <motion.div className="stats-grid" variants={itemVariants}>
            <div className="stat-card card-base investido">
            <div className="stat-icon"><i className="fa-solid fa-chart-line"></i></div>
            <div className="stat-content">
                <span>Total Investido Ativo</span>
                <CountUp className="stat-value" end={totalInvestido} duration={1.5} prefix="R$ " separator="." decimal="," decimals={2}/>
            </div>
            </div>
            <div className="stat-card card-base saldo">
            <div className="stat-icon"><i className="fa-solid fa-wallet"></i></div>
            <div className="stat-content">
                <span>Saldo do Cliente</span>
                <CountUp className="stat-value" end={client.balance || 0} duration={1.5} prefix="R$ " separator="." decimal="," decimals={2}/>
            </div>
            </div>
            <div className="stat-card card-base comissao-paga">
            <div className="stat-icon"><i className="fa-solid fa-hand-holding-dollar"></i></div>
            <div className="stat-content">
                <span>Comissão Recebida</span>
                <CountUp className="stat-value" end={totalComissaoPaga} duration={1.5} prefix="R$ " separator="." decimal="," decimals={2}/>
            </div>
            </div>
            <div className="stat-card card-base comissao-pendente">
            <div className="stat-icon"><i className="fa-solid fa-hourglass-half"></i></div>
            <div className="stat-content">
                <span>Comissão Pendente</span>
                <CountUp className="stat-value" end={totalComissaoPendente} duration={1.5} prefix="R$ " separator="." decimal="," decimals={2}/>
            </div>
            </div>
        </motion.div>

        <motion.div className="content-tabs card-base" variants={itemVariants}>
            <div className="tabs">
            <button className={`tab-button ${activeTab === "contracts" ? "active" : ""}`} onClick={() => {setActiveTab("contracts"); setCurrentPage(1);}}>
                Contratos <span className="tab-count">{allContracts.length}</span>
            </button>
            <button className={`tab-button ${activeTab === "withdrawals" ? "active" : ""}`} onClick={() => {setActiveTab("withdrawals"); setCurrentPage(1);}}>
                Saques <span className="tab-count">{allWithdraws.length}</span>
            </button>
            </div>

            <AnimatePresence mode="wait">
            <motion.div key={activeTab} variants={tabContentVariants} initial="initial" animate="in" exit="out" className="tab-content">
                {activeTab === "contracts" && (
                <div className="table-responsive">
                    <table>
                    <thead>
                        <tr>
                        <th>ID</th>
                        <th>Valor</th>
                        <th>Status Contrato</th>
                        <th>Comissão</th>
                        <th>Status Comissão</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedItems.length > 0 ? (paginatedItems.map(c => (
                        <tr key={c.id} onClick={() => navigate(`/platform/clientes/${clientId}/contratos/${c.id}`)} className="clickable-row">
                            <td>#{c.id}</td>
                            <td>{formatCurrency(c.amount)}</td>
                            <td>{getStatusBadge(c.status, "contract")}</td>
                            <td>{c.commissionExists ? formatCurrency(c.commissionAmount) : "N/A"}</td>
                            <td>{c.commissionExists ? getStatusBadge(c.commissionStatus, "commission") : "N/A"}</td>
                        </tr>
                        ))) : (<tr><td colSpan="5" className="placeholder-text">Nenhum contrato encontrado.</td></tr>)}
                    </tbody>
                    </table>
                </div>
                )}
                {activeTab === "withdrawals" && (
                <div className="table-responsive">
                    <table>
                    <thead>
                        <tr>
                        <th>ID</th>
                        <th>Valor Solicitado</th>
                        <th>Valor a Receber</th>
                        <th>Data</th>
                        <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedItems.length > 0 ? (paginatedItems.map(w => (
                        <tr key={w.id}>
                            <td>#{w.id}</td>
                            <td>{formatCurrency(w.amountWithdrawn)}</td>
                            <td>{formatCurrency(w.amountReceivable)}</td>
                            <td>{formatDate(w.dateCreated)}</td>
                            <td>{getStatusBadge(w.status, "withdraw")}</td>
                        </tr>
                        ))) : (<tr><td colSpan="5" className="placeholder-text">Nenhum saque encontrado.</td></tr>)}
                    </tbody>
                    </table>
                </div>
                )}
                
                {totalPages > 1 && paginatedItems.length > 0 && (
                <div className="pagination-controls">
                    <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}>Anterior</button>
                    <span>Página {currentPage} de {totalPages}</span>
                    <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages}>Próxima</button>
                </div>
                )}
            </motion.div>
            </AnimatePresence>
        </motion.div>
    </motion.div>
  );
};

export default ClientDetailPage;