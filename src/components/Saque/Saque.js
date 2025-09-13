import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../Context/AuthContext';
import consultantService from '../../dbServices/consultantService';
import './Saque.css';

const formatCurrency = (value) => {
  if (value === null || value === undefined) return "R$ 0,00";
  return `R$${value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const options = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleString('pt-BR', options);
};

const WithdrawStatus = ({ status }) => {
  const statusMap = {
    1: { text: 'Pendente', className: 'status-pending' },
    2: { text: 'Pago', className: 'status-paid' },
    3: { text: 'Cancelado', className: 'status-canceled' },
  };
  const { text, className } = statusMap[status] || { text: 'Desconhecido', className: '' };
  return <span className={`status-badge ${className}`}>{text}</span>;
};

const Saque = () => {
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { user, updateUserBalance } = useAuth();
  const availableBalance = user?.balance || 0;

  const [history, setHistory] = useState([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [pagination, setPagination] = useState({ pageNumber: 1, totalPages: 1 });
  const [filters, setFilters] = useState({ status: 0, sortOrder: 'desc' });

  const fetchHistory = useCallback(async () => {
    setIsHistoryLoading(true);
    setError('');
    try {
      const params = { ...filters, pageNumber: pagination.pageNumber, pageSize: 10 };
      if (params.status === 0 || params.status === "0") delete params.status;

      const response = await consultantService.getMyWithdraws(params);
      setHistory(response.data.items || []); 
      setPagination(prev => ({
        ...prev,
        totalPages: Math.ceil(response.data.totalCount / response.data.pageSize) || 1,
      }));
    } catch (err) {
      setError('Falha ao carregar o histórico de saques.');
      setHistory([]);
    } finally {
      setIsHistoryLoading(false);
    }
  }, [pagination.pageNumber, filters]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPagination(prev => ({ ...prev, pageNumber: 1 }));
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, pageNumber: newPage }));
    }
  };

  const handleWithdrawRequest = async () => {
    setError('');
    setSuccess('');
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError("Por favor, insira um valor de saque válido.");
      return;
    }
    if (numericAmount > availableBalance) {
      setError("O valor do saque não pode ser maior que o saldo disponível.");
      return;
    }

    setIsSendingCode(true);
    try {
      await consultantService.sendWithdrawVerificationCode();
      setIsModalOpen(true);
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Ocorreu um erro ao enviar o código de verificação.";
      setError(errorMessage);
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleConfirmWithdraw = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const withdrawData = {
        amount: parseFloat(amount),
        verificationCode: verificationCode,
      };
      await consultantService.createWithdraw(withdrawData);
      
      const newBalance = availableBalance - parseFloat(amount);
      updateUserBalance(newBalance);
      
      setSuccess(`Saque de ${formatCurrency(parseFloat(amount))} solicitado com sucesso!`);
      setAmount('');
      setVerificationCode('');
      setIsModalOpen(false);
      
      setPagination(p => ({ ...p, pageNumber: 1 }));
      if (pagination.pageNumber === 1) {
        fetchHistory();
      }

    } catch (err) {
      const errorMessage = err.response?.data?.message || "Ocorreu um erro ao solicitar o saque. Tente novamente.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setVerificationCode('');
    setError('');
  };

  return (
    <div className="saque-page">
      <div className="page-header">
        <h1>Saque</h1>
        <p>Gerencie suas comissões e solicite seus saques.</p>
      </div>

      <div className="card-base saque-card">
        <div className="saldo-disponivel">
          <span>Saldo Disponível</span>
          <h2 className="saldo-valor">{formatCurrency(availableBalance)}</h2>
        </div>
        {error && !isModalOpen && <p className="saque-message error">{error}</p>}
        {success && <p className="saque-message success">{success}</p>}
        <div className="saque-form">
          <label htmlFor="valor-saque">Valor do Saque</label>
          <div className="saque-input-wrapper">
            <span className="input-prefix">R$</span>
            <input id="valor-saque" type="number" placeholder="0,00" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <button className="saque-button" onClick={handleWithdrawRequest} disabled={isLoading || isSendingCode}>
            {isSendingCode ? 'Enviando código...' : <><i className="fa-solid fa-paper-plane"></i> Solicitar Saque</>}
          </button>
        </div>
      </div>

      <div className="card-base history-section">
        <h2>Histórico de Saques</h2>
        <div className="filters-container">
          <select name="status" value={filters.status} onChange={handleFilterChange}>
            <option value="0">Todos os Status</option>
            <option value="1">Pendente</option>
            <option value="2">Pago</option>
            <option value="3">Cancelado</option>
          </select>
          <select name="sortOrder" value={filters.sortOrder} onChange={handleFilterChange}>
            <option value="desc">Mais Recentes</option>
            <option value="asc">Mais Antigos</option>
          </select>
        </div>

        <div className="table-wrapper">
          <table className="withdraws-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Data</th>
                <th>Valor</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {isHistoryLoading ? (
                <tr><td colSpan="4" className="loading-cell">Carregando histórico...</td></tr>
              ) : history.length > 0 ? (
                history.map(item => (
                  <tr key={item.id}>
                    <td>#{item.id}</td>
                    <td>{formatDate(item.dateCreated)}</td>
                    <td>{formatCurrency(item.amountWithdrawn)}</td>
                    <td><WithdrawStatus status={item.status} /></td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="4" className="empty-cell">Nenhum saque encontrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="pagination-controls">
          <button onClick={() => handlePageChange(pagination.pageNumber - 1)} disabled={pagination.pageNumber === 1 || isHistoryLoading}>Anterior</button>
          <span>Página {pagination.pageNumber} de {pagination.totalPages}</span>
          <button onClick={() => handlePageChange(pagination.pageNumber + 1)} disabled={pagination.pageNumber === pagination.totalPages || isHistoryLoading}>Próximo</button>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Confirmar Saque</h3>
            <p>Um código de verificação foi enviado para o seu email. Por favor, insira-o abaixo para confirmar a operação.</p>
            {error && <p className="saque-message error modal-error">{error}</p>}
            <input type="text" className="modal-input" placeholder="Código de Verificação" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} />
            <div className="modal-actions">
              <button className="modal-button cancel" onClick={closeModal} disabled={isLoading}>Cancelar</button>
              <button className="modal-button confirm" onClick={handleConfirmWithdraw} disabled={isLoading}>{isLoading ? 'Confirmando...' : 'Confirmar Saque'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Saque;