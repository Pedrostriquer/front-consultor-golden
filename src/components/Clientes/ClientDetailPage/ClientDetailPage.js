import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import clientService from "../../../dbServices/clientService";
import saleService from "../../../dbServices/saleService";
import "./ClientDetailPage.css";

// --- Funções Auxiliares ---
const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("pt-BR");
};

const formatCurrency = (value) => `R$${(value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const getStatusBadge = (status, type = 'user') => {
    const statusText = status ? (typeof status === 'string' ? status.toUpperCase() : status) : 'DESCONHECIDO';
    const statusMap = {
      user: {
        1: { text: "Ativo", className: "status-active" },
      },
      // Status para Contratos (usado na tabela)
      contract: {
        1: { text: "Ativo", className: "status-active" },
        3: { text: "Cancelado", className: "status-canceled" },
        4: { text: "Pendente", className: "status-pending" },
      }
    };
    // Prioriza o mapa de 'contract', mas mantém um fallback genérico se necessário
    const { text, className } = statusMap[type]?.[statusText] || { text: statusText, className: ""};
    return <span className={`status-badge ${className}`}>{text}</span>;
};


const TableSkeleton = ({ columns = 5 }) => (
    <tbody>
      {[...Array(5)].map((_, i) => (
        <tr key={i} className="skeleton-row">
          {[...Array(columns)].map((_, j) => (
            <td key={j}><div className="skeleton-bar" style={{ width: `${Math.random() * 40 + 50}%` }}></div></td>
          ))}
        </tr>
      ))}
    </tbody>
  );


// --- Componente Principal ---
const ClientDetailPage = () => {
  const { cpfCnpj } = useParams();
  const navigate = useNavigate();
  
  const [client, setClient] = useState(null);
  // **CORREÇÃO: Voltamos a usar 'sales' para manter o sale.id**
  const [sales, setSales] = useState([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSales, setIsLoadingSales] = useState(true); 
  const [error, setError] = useState("");

  const [salesPage, setSalesPage] = useState(1);
  const [totalSalesPages, setTotalSalesPages] = useState(0);
  const salesPageSize = 5;

  useEffect(() => {
    const fetchClientDetails = async () => {
        setIsLoading(true);
        setError("");
        try {
            const clientData = await clientService.getClientByCpfCnpj(cpfCnpj);
            setClient(clientData);
        } catch (err) {
            console.error("Erro ao buscar dados do cliente:", err);
            if (err.response?.status === 403) {
                setError("Você não tem permissão para visualizar este cliente.");
            } else {
                setError("Não foi possível carregar os dados do cliente.");
            }
        } finally {
            setIsLoading(false);
        }
    };
    if (cpfCnpj) {
        fetchClientDetails();
    }
  }, [cpfCnpj]);

  useEffect(() => {
    const fetchSales = async () => {
        if (!client) return;
        setIsLoadingSales(true);
        try {
            const salesData = await saleService.searchSales({ clientId: client.id, pageNumber: salesPage, pageSize: salesPageSize });
            // **CORREÇÃO: Armazenamos o array de vendas completo, sem o .map**
            setSales(salesData.sales);
            setTotalSalesPages(Math.ceil(salesData.totalCount / salesPageSize));
        } catch (err) {
            console.error("Erro ao buscar vendas:", err);
        } finally {
            setIsLoadingSales(false);
        }
    };
    fetchSales();
  }, [client, salesPage]);


  // **CORREÇÃO: A função de clique agora usa o 'sale.id' para a navegação correta**
  const handleSaleClick = (sale) => {
    navigate(`/platform/vendas/${sale.id}/detalhes`);
  };

  const pageVariants = {
    initial: { opacity: 0 },
    in: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };
  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  if (isLoading) {
    return <div className="client-detail-loading">A carregar detalhes do cliente...</div>;
  }
  if (error) {
    return (
        <div className="client-detail-page">
             <motion.button onClick={() => navigate('/platform/clientes')} className="back-button">
                <i className="fa-solid fa-arrow-left"></i> Voltar para Meus Clientes
            </motion.button>
            <div className="client-detail-error">{error}</div>
        </div>
    );
  }
  if (!client) {
    return null;
  }

  return (
    <motion.div className="client-detail-page" variants={pageVariants} initial="initial" animate="in">
      <motion.button onClick={() => navigate('/platform/clientes')} className="back-button" variants={itemVariants}>
        <i className="fa-solid fa-arrow-left"></i> Voltar para Meus Clientes
      </motion.button>

      {/* ... (cabeçalho e detalhes do cliente permanecem os mesmos) ... */}
      <motion.div className="client-header card-base" variants={itemVariants}>
        <div className="client-info">
          <h1>{client.name}</h1>
          <p>{client.email}</p>
        </div>
        <div className="client-status">
            <span>Status</span>
            {getStatusBadge(client.status, 'user')}
        </div>
      </motion.div>

      <motion.div className="details-grid" variants={itemVariants}>
        <div className="details-card card-base">
          <h3><i className="fa-solid fa-user"></i> Informações Pessoais</h3>
          <ul>
            <li><span>CPF/CNPJ</span> <strong>{client.cpfCnpj}</strong></li>
            <li><span>Telefone</span> <strong>{client.phoneNumber}</strong></li>
            <li><span>Data de Nascimento</span> <strong>{formatDate(client.birthDate)}</strong></li>
            <li><span>Cliente desde</span> <strong>{formatDate(client.dateCreated)}</strong></li>
          </ul>
        </div>
        <div className="details-card card-base">
          <h3><i className="fa-solid fa-location-dot"></i> Endereço</h3>
          <ul>
            <li><span>Rua</span> <strong>{client.address?.street}, {client.address?.number}</strong></li>
            <li><span>Bairro</span> <strong>{client.address?.neighborhood}</strong></li>
            <li><span>Cidade/Estado</span> <strong>{client.address?.city} / {client.address?.state}</strong></li>
            <li><span>CEP</span> <strong>{client.address?.zipcode}</strong></li>
          </ul>
        </div>
        <div className="details-card card-base">
          <h3><i className="fa-solid fa-piggy-bank"></i> Dados Bancários</h3>
          <ul>
            <li><span>Banco</span> <strong>{client.bankAccount?.bank}</strong></li>
            <li><span>Agência</span> <strong>{client.bankAccount?.agencyNumber}</strong></li>
            <li><span>Conta</span> <strong>{client.bankAccount?.accountNumber}</strong></li>
            <li><span>Chave PIX</span> <strong>{client.bankAccount?.pixKey}</strong></li>
          </ul>
        </div>
      </motion.div>
      
      {/* --- Tabela de Contratos --- */}
      <motion.div className="related-info-grid" variants={itemVariants}>
        <div className="contracts-list card-base">
          <h3>Contratos do Cliente</h3>
            <table>
              <thead>
                <tr>
                  <th>ID do Contrato</th>
                  <th>Valor Total</th>
                  <th>Qtd.</th>
                  <th>Status</th>
                  <th>Data de Início</th>
                </tr>
              </thead>
              {isLoadingSales ? (
                <TableSkeleton columns={5}/>
              ) : (
                <tbody>
                  {sales && sales.length > 0 ? (
                    sales.map(sale => (
                      // **CORREÇÃO: O clique passa o objeto 'sale' completo**
                      <tr key={sale.id} className="clickable-row" onClick={() => handleSaleClick(sale)}>
                        {/* **CORREÇÃO: Acessamos os dados do contrato via 'sale.contract'** */}
                        <td>#{sale.contract.id}</td>
                        <td>{formatCurrency(sale.contract.totalPrice)}</td>
                        <td>{sale.contract.contractQtt}</td>
                        <td>{getStatusBadge(sale.contract.status, 'contract')}</td>
                        <td>{formatDate(sale.contract.dateCreated)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="5"><p className="empty-message">Nenhum contrato encontrado para este cliente.</p></td></tr>
                  )}
                </tbody>
              )}
            </table>
            {totalSalesPages > 1 && (
                <div className="pagination-controls">
                    <button onClick={() => setSalesPage(p => Math.max(1, p - 1))} disabled={salesPage === 1}>
                        Anterior
                    </button>
                    <span>Página {salesPage} de {totalSalesPages}</span>
                    <button onClick={() => setSalesPage(p => Math.min(totalSalesPages, p + 1))} disabled={salesPage === totalSalesPages}>
                        Próxima
                    </button>
                </div>
            )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ClientDetailPage;