import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import CountUp from "react-countup";
import consultantService from "../../../dbServices/consultantService";
import LoadingScreen from "../../LoadingScreen/LoadingScreen";
import formatters from "../../../utils/formatters";
import "./ClientDetailPage.css";

const ITEMS_PER_PAGE = 5;

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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("contracts");
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  console.log(allContracts)

  const fetchAllData = useCallback(async () => {
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  }, [clientId]);

  const handleContactClick = () => {
    const result = formatters.formatPhoneNumberForWhatsapp(client?.phoneNumber);
    if (result.error) {
        alert(result.message);
    } else {
        window.open(result.link, '_blank', 'noopener,noreferrer');
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleContractClick = (contractId) => {
    navigate(`/platform/clientes/${clientId}/contratos/${contractId}`);
  };

  const { paginatedItems, totalPages } = useMemo(() => {
    const sourceData = activeTab === "contracts" ? allContracts : allWithdraws;
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const items = sourceData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    const pages = Math.max(1, Math.ceil(sourceData.length / ITEMS_PER_PAGE));
    return { paginatedItems: items, totalPages: pages };
  }, [allContracts, allWithdraws, currentPage, activeTab]);

  const changePage = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  if (isLoading) return <LoadingScreen />;
  if (error) return <div className="client-detail-page error-message">{error}</div>;
  if (!client) return null;

  const totalInvestido = allContracts.filter((c) => c.status === 2).reduce((sum, c) => sum + c.amount, 0);
  const totalComissaoPaga = allContracts.filter((c) => c.commissionStatus === 2).reduce((sum, c) => sum + (c.commissionAmount || 0), 0);
  const totalComissaoPendente = allContracts.filter((c) => c.commissionStatus === 1).reduce((sum, c) => sum + (c.commissionAmount || 0), 0);
  
  const getInitials = (name) => (name ? name.charAt(0).toUpperCase() : "");

  return (
    <div className="client-detail-page">
      <div className="client-page-header">
        <Link to="/platform/clientes" className="back-button">
          <i className="fa-solid fa-arrow-left"></i> Voltar para clientes
        </Link>
        <button onClick={handleContactClick} className="whatsapp-button">
          <i className="fa-brands fa-whatsapp"></i> Entrar em contato
        </button>
      </div>

      <div className="client-info-card card-base">
        <div className="client-avatar">{getInitials(client.name)}</div>
        <div className="client-info-main">
          <h1 className="client-name">{client.name}</h1>
          <p className="client-detail">CPF/CNPJ: {client.cpfCnpj}</p>
          <p className="client-detail">Email: {client.email}</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card card-base">
          <span>Total Investido Ativo</span>
          <CountUp className="stat-value" end={totalInvestido} duration={1.5} prefix="R$ " separator="." decimal="," decimals={2}/>
        </div>
        <div className="stat-card card-base">
          <span>Saldo do Cliente</span>
          <CountUp className="stat-value" end={client.balance || 0} duration={1.5} prefix="R$ " separator="." decimal="," decimals={2}/>
        </div>
        <div className="stat-card card-base">
          <span>Comissão Recebida</span>
          <CountUp className="stat-value" end={totalComissaoPaga} duration={1.5} prefix="R$ " separator="." decimal="," decimals={2}/>
        </div>
        <div className="stat-card card-base">
          <span>Comissão Pendente</span>
          <CountUp className="stat-value" end={totalComissaoPendente} duration={1.5} prefix="R$ " separator="." decimal="," decimals={2}/>
        </div>
      </div>

      <div className="content-tabs card-base">
        <div className="tabs">
          <button className={`tab-button ${activeTab === "contracts" ? "active" : ""}`} onClick={() => handleTabClick("contracts")}>
            Contratos ({allContracts.length})
          </button>
          <button className={`tab-button ${activeTab === "withdrawals" ? "active" : ""}`} onClick={() => handleTabClick("withdrawals")}>
            Saques ({allWithdraws.length})
          </button>
        </div>
        <div className="tab-content">
          {activeTab === "contracts" && (
            <>
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
                    {paginatedItems.length > 0 ? (
                      paginatedItems.map((contract) => (
                        <tr key={contract.id} onClick={() => handleContractClick(contract.id)} className="clickable-row">
                          <td>#{contract.id}</td>
                          <td>{formatCurrency(contract.amount)}</td>
                          <td>{getStatusBadge(contract.status, "contract")}</td>
                          <td>{contract.commissionExists ? formatCurrency(contract.commissionAmount) : "N/A"}</td>
                          <td>{contract.commissionExists ? getStatusBadge(contract.commissionStatus, "commission") : "N/A"}</td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan="5" className="placeholder-text">Nenhum contrato encontrado.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
          {activeTab === "withdrawals" && (
            <>
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
                    {paginatedItems.length > 0 ? (
                      paginatedItems.map((withdraw) => (
                        <tr key={withdraw.id}>
                          <td>#{withdraw.id}</td>
                          <td>{formatCurrency(withdraw.amountWithdrawn)}</td>
                          <td>{formatCurrency(withdraw.amountReceivable)}</td>
                          <td>{formatDate(withdraw.dateCreated)}</td>
                          <td>{getStatusBadge(withdraw.status, "withdraw")}</td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan="5" className="placeholder-text">Nenhum saque encontrado.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
          {paginatedItems.length > 0 && (
            <div className="pagination-controls">
              <button onClick={() => changePage(currentPage - 1)} disabled={currentPage === 1}>Anterior</button>
              <span>Página {currentPage} de {totalPages}</span>
              <button onClick={() => changePage(currentPage + 1)} disabled={currentPage === totalPages}>Próxima</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientDetailPage;