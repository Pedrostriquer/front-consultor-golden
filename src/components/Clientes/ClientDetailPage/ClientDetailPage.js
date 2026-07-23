import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import clientService from "../../../dbServices/clientService";
import "./ClientDetailPage.css";

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const options = { day: "2-digit", month: "2-digit", year: "numeric" };
  return new Date(dateString).toLocaleDateString("pt-BR", options);
};

const formatCurrency = (value) =>
  `R$${(typeof value === "number" ? value : 0).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

// Semântica confirmada nos fronts oficiais dos clientes de cada plataforma
const getStatusBadge = (status, platform) => {
  const isDiamond = platform === "DIAMOND_PRIME";
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

// Status de saque é o mesmo nas duas plataformas (4 só existe no CPOM)
const getWithdrawStatusBadge = (status) => {
  const statusMap = {
    1: { text: "Pendente", className: "status-pending" },
    2: { text: "Pago", className: "status-completed" },
    3: { text: "Cancelado", className: "status-canceled" },
    4: { text: "Ctr. Recomprado", className: "status-default" },
  };
  const { text, className } = statusMap[status] || {
    text: `Status ${status}`,
    className: "status-default",
  };
  return <span className={`status-badge ${className}`}>{text}</span>;
};

const getClientStatus = (status) => (status === 1 ? "Ativo" : "Inativo");

// Rótulos por plataforma para os chips de filtro
const CONTRACT_STATUS_LABELS = {
  DIAMOND_PRIME: {
    1: "Pendente",
    2: "Ativo",
    3: "Cancelado",
    4: "Finalizado",
  },
  CONTRATO_DE_MINERIOS: {
    1: "Valorizando",
    2: "Valorização Concluída",
    3: "Cancelado",
    4: "Pendente",
    5: "Recomprado",
  },
};

const WITHDRAW_STATUS_LABELS = {
  1: "Pendente",
  2: "Pago",
  3: "Cancelado",
  4: "Ctr. Recomprado",
};

// Tipo do saque — mesma regra do portal do cliente do CPOM:
// flag sponsorWithdraw → Indicação; descrição com "golden box"/"caixinha"
// → transferência para a Golden Box; com "recompra" → recompra.
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
  const contrato = w.contractId ? ` do contrato #${w.contractId}` : "";
  const desc = (w.description || "").toLowerCase();
  if (w.sponsorWithdraw) return `Saque de Indicação de ${valor}`;
  if (desc.includes("golden box") || desc.includes("caixinha"))
    return `Transferência para Golden Box de ${valor}${contrato}`;
  if (desc.includes("recompra"))
    return `Saque para Recompra de ${valor}${contrato}`;
  return `Saque de ${valor}${contrato}`;
};

// Chips de filtro por status (com contagem), derivados dos dados presentes.
// `hidden` remove um status da lista de filtros (os itens continuam na tabela).
const StatusFilterChips = ({
  items,
  getStatus,
  labels,
  value,
  onChange,
  hidden = [],
}) => {
  const counts = items.reduce((acc, item) => {
    const s = getStatus(item);
    if (s == null) return acc;
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});
  const statuses = Object.keys(counts)
    .map(Number)
    .filter((s) => !hidden.includes(s))
    .sort((a, b) => a - b);
  if (statuses.length <= 1) return null;
  return (
    <div className="status-filter-chips">
      <button
        className={value === "all" ? "chip active" : "chip"}
        onClick={() => onChange("all")}
      >
        Todos ({items.length})
      </button>
      {statuses.map((s) => (
        <button
          key={s}
          className={value === s ? "chip active" : "chip"}
          onClick={() => onChange(s)}
        >
          {labels[s] || `Status ${s}`} ({counts[s]})
        </button>
      ))}
    </div>
  );
};

const Pagination = ({
  totalItems,
  itemsPerPage,
  currentPage,
  onPageChange,
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  if (totalPages <= 1) return null;
  return (
    <div className="pagination-controls">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Anterior
      </button>
      <span>
        Página {currentPage} de {totalPages}
      </span>
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Próxima
      </button>
    </div>
  );
};

const UniversalContractsTable = ({
  contracts,
  platformId,
  onContractClick,
}) => {
  const isDiamond = platformId === "DIAMOND_PRIME";
  return (
    <motion.table
      key="contracts"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <thead>
        <tr>
          <th>ID</th>
          <th>{isDiamond ? "Valor Aplicado" : "Valor do Contrato"}</th>
          <th>Status</th>
          {isDiamond ? <th>Valor Final</th> : <th>Disponível Saque</th>}
          {isDiamond ? <th>Data da Aplicação</th> : <th>Data Final</th>}
        </tr>
      </thead>
      <tbody>
        {contracts && contracts.length > 0 ? (
          contracts.map((item) => (
            <tr
              key={isDiamond ? item.id : item.contract.id}
              onClick={() => onContractClick(item)}
              className="clickable-row"
            >
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
                  <td className="valor-disponivel">
                    {formatCurrency(item.avaliableToWithdraw)}
                  </td>
                  <td>{formatDate(item.contract.endContractDate)}</td>
                </>
              )}
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="5" className="empty-message">
              Nenhum contrato encontrado.
            </td>
          </tr>
        )}
      </tbody>
    </motion.table>
  );
};

const WithdrawsTable = ({ withdraws }) => (
  <motion.table
    key="withdraws"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
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
      {withdraws && withdraws.length > 0 ? (
        withdraws.map((w) => (
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
            Nenhum saque realizado.
          </td>
        </tr>
      )}
    </tbody>
  </motion.table>
);

const ClientDetailPage = () => {
  const { cpfCnpj } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [clientData, setClientData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("contracts");
  const [contractsPage, setContractsPage] = useState(1);
  const [withdrawsPage, setWithdrawsPage] = useState(1);
  const [contractStatusFilter, setContractStatusFilter] = useState("all");
  const [withdrawStatusFilter, setWithdrawStatusFilter] = useState("all");
  const [contractIdSearch, setContractIdSearch] = useState("");
  const ITEMS_PER_PAGE = 5;

  useEffect(() => {
    const fetchClientDetails = async () => {
      const platformId = location.state?.platformId;
      if (!cpfCnpj || !platformId) {
        setError("Informações cruciais não encontradas.");
        setIsLoading(false);
        return;
      }
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
  }, [activeTab, contractStatusFilter, withdrawStatusFilter, contractIdSearch]);

  // A tabela mostra TODOS os contratos e saques do cliente (os backends já
  // enviam tudo); só os cards de totais filtram por contrato ativo.
  const allContracts = useMemo(() => {
    if (!clientData?.contracts) return [];
    return clientData.contracts.filter(Boolean);
  }, [clientData]);

  const activeContracts = useMemo(() => {
    const platformId = clientData?.clientInfo?.platformId;
    return allContracts.filter((item) =>
      platformId === "DIAMOND_PRIME"
        ? item.status === 2
        : item.contract?.status === 1
    );
  }, [allContracts, clientData]);

  const allWithdraws = useMemo(() => {
    if (!clientData?.withdraws) return [];
    return clientData.withdraws.filter(Boolean);
  }, [clientData]);

  const totalInvestido = useMemo(() => {
    const isDiamond = clientData?.clientInfo?.platformId === "DIAMOND_PRIME";
    return isDiamond
      ? activeContracts.reduce((s, i) => s + (i.amount || 0), 0)
      : activeContracts.reduce(
          (s, i) => s + (i.contract?.totalPrice || 0),
          0
        );
  }, [activeContracts, clientData]);

  const totalSacado = useMemo(() => {
    // Saque cancelado (status 3) devolve o valor, então fica fora da soma
    return allWithdraws
      .filter((w) => w.status !== 3)
      .reduce((s, i) => s + (i.amountWithdrawn || 0), 0);
  }, [allWithdraws]);

  const totalDisponivel = useMemo(() => {
    const isDiamond = clientData?.clientInfo?.platformId === "DIAMOND_PRIME";
    if (isDiamond) return clientData?.clientInfo?.balance || 0;
    return activeContracts.reduce(
      (s, i) => s + (i.avaliableToWithdraw || 0),
      0
    );
  }, [activeContracts, clientData]);

  // Listas visíveis após os filtros (chips de status + busca por ID do contrato)
  const visibleContracts = useMemo(() => {
    const isDiamond = clientData?.clientInfo?.platformId === "DIAMOND_PRIME";
    let list = allContracts;
    if (contractStatusFilter !== "all") {
      list = list.filter(
        (item) =>
          (isDiamond ? item.status : item.contract?.status) ===
          contractStatusFilter
      );
    }
    const q = contractIdSearch.trim();
    if (q) {
      list = list.filter((item) =>
        String((isDiamond ? item.id : item.contract?.id) ?? "").includes(q)
      );
    }
    return list;
  }, [allContracts, contractStatusFilter, contractIdSearch, clientData]);

  const visibleWithdraws = useMemo(() => {
    let list = allWithdraws;
    if (withdrawStatusFilter !== "all") {
      list = list.filter((w) => w.status === withdrawStatusFilter);
    }
    const q = contractIdSearch.trim();
    if (q) {
      list = list.filter((w) => String(w.contractId ?? "").includes(q));
    }
    return list;
  }, [allWithdraws, withdrawStatusFilter, contractIdSearch]);

  const paginatedContracts = useMemo(() => {
    const startIndex = (contractsPage - 1) * ITEMS_PER_PAGE;
    return visibleContracts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [visibleContracts, contractsPage]);

  const paginatedWithdraws = useMemo(() => {
    const startIndex = (withdrawsPage - 1) * ITEMS_PER_PAGE;
    return visibleWithdraws.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [visibleWithdraws, withdrawsPage]);

  const handleContractClick = (contractData) => {
    if (!clientData?.clientInfo) return;
    const isDiamondPlatform =
      clientData.clientInfo.platformId === "DIAMOND_PRIME";
    const contractId = isDiamondPlatform
      ? contractData.id
      : contractData.contract.id;
    // Na Diamond Prime o saque não tem vínculo com contrato
    const contractWithdraws = isDiamondPlatform
      ? []
      : allWithdraws.filter((w) => w.contractId === contractId);
    navigate(`/platform/contrato/${contractId}`, {
      state: {
        contractData,
        platformId: clientData.clientInfo.platformId,
        clientName: clientData.clientInfo.name,
        contractWithdraws,
      },
    });
  };

  if (isLoading)
    return (
      <div className="client-detail-loading">
        Carregando detalhes do cliente...
      </div>
    );
  if (error)
    return (
      <div className="client-detail-page">
        <div className="client-detail-error">{error}</div>
      </div>
    );
  if (!clientData || !clientData.clientInfo) return null;

  const { clientInfo } = clientData;
  const isDiamond = clientInfo.platformId === "DIAMOND_PRIME";

  return (
    <motion.div
      className="client-detail-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.button
        onClick={() => navigate("/platform/clientes")}
        className="back-button"
      >
        <i className="fa-solid fa-arrow-left"></i> Voltar
      </motion.button>
      <motion.div className="client-header card-base">
        <div className="client-info">
          <h1>{clientInfo.name}</h1>
          <p>{clientInfo.email}</p>
        </div>
        <div
          className={`client-status-tag status-${getClientStatus(
            clientInfo.status
          ).toLowerCase()}`}
        >
          {getClientStatus(clientInfo.status)}
        </div>
      </motion.div>
      <motion.div className="details-grid">
        <div className="details-card card-base">
          <h3>
            <i className="fa-solid fa-user-check"></i> Informações Pessoais
          </h3>
          <ul>
            <li>
              <span>CPF/CNPJ</span> <strong>{clientInfo.cpfCnpj}</strong>
            </li>
            <li>
              <span>Telefone(s)</span>{" "}
              <strong>{clientInfo.phoneNumber || "N/A"}</strong>
            </li>
            <li>
              <span>Cliente Desde</span>{" "}
              <strong>{formatDate(clientInfo.dateCreated)}</strong>
            </li>
          </ul>
        </div>
        <div className="details-card card-base">
          <h3>
            <i className="fa-solid fa-chart-pie"></i> Resumo Financeiro
          </h3>
          <ul>
            <li>
              <span>
                {isDiamond
                  ? "Total Aplicado (Ativos)"
                  : "Total Investido (Ativos)"}
              </span>
              <strong className="valor-neutro">
                {formatCurrency(totalInvestido)}
              </strong>
            </li>
            <li>
              <span>Total Sacado</span>
              <strong className="valor-negativo">
                {formatCurrency(totalSacado)}
              </strong>
            </li>
            <li>
              <span>
                {isDiamond ? "Saldo em Conta" : "Disponível p/ Saque"}
              </span>
              <strong className="valor-disponivel">
                {formatCurrency(totalDisponivel)}
              </strong>
            </li>
          </ul>
        </div>
      </motion.div>
      <motion.div className="data-table-container card-base">
        <div className="table-tabs">
          <button
            className={`tab-button ${
              activeTab === "contracts" ? "active" : ""
            }`}
            onClick={() => setActiveTab("contracts")}
          >
            <i className="fa-solid fa-file-signature"></i> Contratos (
            {allContracts.length})
          </button>
          <button
            className={`tab-button ${
              activeTab === "withdraws" ? "active" : ""
            }`}
            onClick={() => setActiveTab("withdraws")}
          >
            <i className="fa-solid fa-money-bill-transfer"></i> Saques (
            {allWithdraws.length})
          </button>
        </div>
        <div className="table-content">
          <div className="contract-id-search">
            <i className="fa-solid fa-magnifying-glass"></i>
            <input
              type="text"
              inputMode="numeric"
              placeholder="Buscar por ID do contrato..."
              value={contractIdSearch}
              onChange={(e) =>
                setContractIdSearch(e.target.value.replace(/\D/g, ""))
              }
            />
            {contractIdSearch && (
              <button
                className="clear-search"
                onClick={() => setContractIdSearch("")}
                title="Limpar busca"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            )}
          </div>
          {activeTab === "contracts" ? (
            <StatusFilterChips
              items={allContracts}
              getStatus={(item) =>
                isDiamond ? item.status : item.contract?.status
              }
              labels={
                CONTRACT_STATUS_LABELS[clientInfo.platformId] ||
                CONTRACT_STATUS_LABELS.CONTRATO_DE_MINERIOS
              }
              value={contractStatusFilter}
              onChange={setContractStatusFilter}
              hidden={[5]} // "Recomprado" fora dos filtros (a pedido)
            />
          ) : (
            <StatusFilterChips
              items={allWithdraws}
              getStatus={(w) => w.status}
              labels={WITHDRAW_STATUS_LABELS}
              value={withdrawStatusFilter}
              onChange={setWithdrawStatusFilter}
            />
          )}
          <AnimatePresence mode="wait">
            {activeTab === "contracts" ? (
              <UniversalContractsTable
                contracts={paginatedContracts}
                platformId={clientInfo.platformId}
                onContractClick={handleContractClick}
              />
            ) : (
              <WithdrawsTable withdraws={paginatedWithdraws} />
            )}
          </AnimatePresence>
        </div>
        {activeTab === "contracts" && (
          <Pagination
            totalItems={visibleContracts.length}
            itemsPerPage={ITEMS_PER_PAGE}
            currentPage={contractsPage}
            onPageChange={setContractsPage}
          />
        )}
        {activeTab === "withdraws" && (
          <Pagination
            totalItems={visibleWithdraws.length}
            itemsPerPage={ITEMS_PER_PAGE}
            currentPage={withdrawsPage}
            onPageChange={setWithdrawsPage}
          />
        )}
      </motion.div>
    </motion.div>
  );
};

export default ClientDetailPage;
