import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import saleService from "../../dbServices/saleService";
import clientService from "../../dbServices/clientService";
import "./SaleDetailPage.css";


// --- Funções Auxiliares ---
const formatCurrency = (value) =>
  `R$${(value || 0).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const options = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return new Date(dateString).toLocaleDateString("pt-BR", options);
};

const getStatusBadge = (status) => {
  const statusText = String(status).toUpperCase();
  const statusMap = {
    PENDENTE: { text: "Pendente", className: "status-pending" },
    VENDIDO: { text: "Vendido", className: "status-active" },
    RECEBIDO: { text: "Recebido", className: "status-completed" },
    CANCELADO: { text: "Cancelado", className: "status-canceled" },
  };
  const { text, className } = statusMap[statusText] || {
    text: statusText,
    className: "status-default",
  };
  return <span className={`status-badge ${className}`}>{text}</span>;
};

const SaleDetailPage = () => {
  const { saleId } = useParams();
  const navigate = useNavigate();
  const [sale, setSale] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Estados para o Recibo
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptDescription, setReceiptDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState({ text: "", type: "" });

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

  const handleUploadReceipt = async (e) => {
    e.preventDefault();

    // VALIDAÇÃO DE PLATAFORMA (Somente Contrato de Minérios - ID 1)
    if (sale.platformId !== "CONTRATO_DE_MINERIOS") {
      setUploadMessage({
        text: "Upload direto permitido apenas para a plataforma Contrato de Minérios.",
        type: "error",
      });
      return;
    }

    if (!receiptFile) {
      setUploadMessage({
        text: "Selecione um arquivo primeiro.",
        type: "error",
      });
      return;
    }

    setIsUploading(true);
    setUploadMessage({ text: "", type: "" });

    try {
      // Faz a requisição direta para a nova rota do backend de Minérios (localhost:5097)
      await clientService.addContractReceiptMineriosDirect(
        sale.clientCpfCnpj,
        sale.contractId,
        (receiptDescription + ": Adicionado pelo consultor") || "Recibo enviado pelo consultor via Portal",
        receiptFile
      );

      setUploadMessage({
        text: "Recibo anexado com sucesso diretamente no sistema de minérios!",
        type: "success",
      });
      setReceiptFile(null);
      setReceiptDescription("");
    } catch (err) {
      console.error("Erro no upload direto:", err);
      setUploadMessage({
        text: "Erro ao enviar recibo. Verifique se o servidor de minérios (5097) está rodando.",
        type: "error",
      });
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) return <div className="sale-detail-page">Carregando...</div>;
  if (error)
    return <div className="sale-detail-page sale-detail-error">{error}</div>;
  if (!sale) return null;

  const commissionValue =
    sale.value * (sale.consultant?.commissionPercentage / 100);

  return (
    <motion.div
      className="sale-detail-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <button onClick={() => navigate(-1)} className="back-button">
        <i className="fa-solid fa-arrow-left"></i> Voltar para Vendas
      </button>

      <div className="sale-header card-base">
        <div>
          <h1>Detalhes da Venda #{sale.id}</h1>
          <p>
            Realizada em: <strong>{formatDate(sale.dateCreated)}</strong>
          </p>
        </div>
        {getStatusBadge(sale.status)}
      </div>

      <div className="details-grid">
        <div className="details-card card-base">
          <h3>
            <i className="fa-solid fa-user"></i> Informações do Cliente
          </h3>
          <ul>
            <li>
              <span>Nome</span>
              <strong>{sale.clientName}</strong>
            </li>
            <li>
              <span>CPF/CNPJ</span>
              <strong>{sale.clientCpfCnpj}</strong>
            </li>
          </ul>
        </div>

        <div className="details-card card-base">
          <h3>
            <i className="fa-solid fa-file-invoice-dollar"></i> Valores
          </h3>
          <ul>
            <li>
              <span>Valor da Venda</span>
              <strong className="valor-total">
                {formatCurrency(sale.value)}
              </strong>
            </li>
            <li>
              <span>Comissão ({sale.consultant?.commissionPercentage}%)</span>
              <strong className="valor-comissao">
                {formatCurrency(commissionValue)}
              </strong>
            </li>
          </ul>
        </div>

        {/* SEÇÃO DE UPLOAD CONDICIONAL: APARECE APENAS SE FOR PLATAFORMA ID 1 */}
        {sale.platformId === "CONTRATO_DE_MINERIOS" ? (
          <div className="receipt-upload-card card-base">
            <h3>
              <i className="fa-solid fa-file-arrow-up"></i> Anexar Recibo
              (Direto)
            </h3>
            <form onSubmit={handleUploadReceipt}>
              <div className="form-group">
                <label>Descrição do Recibo</label>
                <input
                  type="text"
                  placeholder="Ex: Comprovante de transferência"
                  value={receiptDescription}
                  onChange={(e) => setReceiptDescription(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Arquivo (PDF ou Imagem)</label>
                <input
                  type="file"
                  onChange={(e) => setReceiptFile(e.target.files[0])}
                  accept=".pdf,image/*"
                />
              </div>

              <button
                type="submit"
                className="upload-button"
                disabled={isUploading}
              >
                {isUploading ? "Enviando..." : "Enviar para Minérios"}
              </button>

              {uploadMessage.text && (
                <div className={`upload-msg ${uploadMessage.type}`}>
                  {uploadMessage.text}
                </div>
              )}
            </form>
          </div>
        ) : (
          <div className="card-base">
            <p style={{ color: "#9CA3AF", fontSize: "0.9rem" }}>
              <i className="fa-solid fa-info-circle"></i> O envio direto de
              recibos não está disponível para esta plataforma.
            </p>
          </div>
        )}
      </div>

      <div className="description-card card-base">
        <h3>
          <i className="fa-solid fa-clipboard-list"></i> Descrição da Venda
        </h3>
        <p>{sale.description}</p>
        <span>ID do Contrato de Referência: #{sale.contractId}</span>
      </div>
    </motion.div>
  );
};

export default SaleDetailPage;
