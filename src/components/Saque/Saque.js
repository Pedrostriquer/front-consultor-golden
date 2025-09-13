import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../Context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import CountUp from 'react-countup';
import consultantService from '../../dbServices/consultantService';
import './Saque.css';

// Funções auxiliares (sem alteração)
const formatCurrency = (value) => {
  if (value === null || value === undefined) return "R$ 0,00";
  return `R$${value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};
const formatDate = (dateString) => {
  if (!dateString) return '-';
  const options = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleString('pt-BR', options);
};

// Componente para Badges de Status
const WithdrawStatus = ({ status }) => {
  const statusMap = {
    1: { text: 'Pendente', className: 'status-pending' },
    2: { text: 'Pago', className: 'status-paid' },
    3: { text: 'Cancelado', className: 'status-canceled' },
  };
  const { text, className } = statusMap[status] || { text: 'Desconhecido', className: '' };
  return <span className={`status-badge ${className}`}>{text}</span>;
};

// --- Componente Principal ---
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
      console.error('Falha ao carregar o histórico de saques.');
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
      
      if (pagination.pageNumber === 1) {
        fetchHistory();
      } else {
        setPagination(p => ({ ...p, pageNumber: 1 }));
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

  // Animações
  const pageVariants = { initial: { opacity: 0 }, in: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { initial: { opacity: 0, y: 20 }, in: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } } };

  return (
    <motion.div className="saque-page" variants={pageVariants} initial="initial" animate="in">
      <motion.div className="page-header" variants={itemVariants}>
        <h1>Saque</h1>
        <p>Gerencie suas comissões e solicite seus saques.</p>
      </motion.div>

      {/* Removido o 'saque-grid' para um layout vertical mais simples */}
      <motion.div className="card-base saque-card" variants={itemVariants}>
        <div className="saldo-disponivel">
          <span>Saldo Disponível</span>
          <h2 className="saldo-valor">
            <CountUp start={0} end={availableBalance} duration={1.5} prefix="R$ " separator="." decimal="," decimals={2} />
          </h2>
        </div>
        <AnimatePresence>
          {error && !isModalOpen && <motion.p initial={{opacity:0, y:-10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}} className="saque-message error">{error}</motion.p>}
          {success && <motion.p initial={{opacity:0, y:-10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}} className="saque-message success">{success}</motion.p>}
        </AnimatePresence>
        <div className="saque-form">
          <label htmlFor="valor-saque">Valor do Saque</label>
          <div className="saque-input-wrapper">
            <span className="input-prefix">R$</span>
            <input id="valor-saque" type="number" placeholder="0,00" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="saque-button" onClick={handleWithdrawRequest} disabled={isLoading || isSendingCode}>
            {isSendingCode ? 'Enviando código...' : <><i className="fa-solid fa-paper-plane"></i> Solicitar Saque</>}
          </motion.button>
        </div>
      </motion.div>

      <motion.div className="card-base history-section" variants={itemVariants}>
        <h2>Histórico de Saques</h2>
        <div className="filters-container">
          <select name="status" value={filters.status} onChange={handleFilterChange}><option value="0">Todos os Status</option><option value="1">Pendente</option><option value="2">Pago</option><option value="3">Cancelado</option></select>
          <select name="sortOrder" value={filters.sortOrder} onChange={handleFilterChange}><option value="desc">Mais Recentes</option><option value="asc">Mais Antigos</option></select>
        </div>
        <div className="table-wrapper">
          {/* Adicionada a classe 'withdraws-table' para especificidade */}
          <table className="withdraws-table">
            <thead><tr><th>ID</th><th>Data</th><th>Valor</th><th>Status</th></tr></thead>
            <tbody>
              {isHistoryLoading ? (
                [...Array(5)].map((_, i) => <tr key={i} className="skeleton-row"><td><div className="skeleton-bar"/></td><td><div className="skeleton-bar"/></td><td><div className="skeleton-bar"/></td><td><div className="skeleton-bar"/></td></tr>)
              ) : history.length > 0 ? (
                history.map(item => (
                  <motion.tr key={item.id} initial={{opacity:0}} animate={{opacity:1}} layout>
                    <td>#{item.id}</td><td>{formatDate(item.dateCreated)}</td><td>{formatCurrency(item.amountWithdrawn)}</td><td><WithdrawStatus status={item.status} /></td>
                  </motion.tr>
                ))
              ) : (
                <tr><td colSpan="4" className="empty-cell">Nenhum saque encontrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {pagination.totalPages > 1 && (
          <div className="pagination-controls">
            <button onClick={() => handlePageChange(pagination.pageNumber - 1)} disabled={pagination.pageNumber === 1 || isHistoryLoading}>Anterior</button>
            <span>Página {pagination.pageNumber} de {pagination.totalPages}</span>
            <button onClick={() => handlePageChange(pagination.pageNumber + 1)} disabled={pagination.pageNumber === pagination.totalPages || isHistoryLoading}>Próximo</button>
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div className="modal-overlay" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
            <motion.div className="modal-content" initial={{scale:0.9, y:20}} animate={{scale:1, y:0}} exit={{scale:0.9, y:20}}>
              <h3><i className="fa-solid fa-shield-halved"></i> Confirmar Saque</h3>
              <p>Um código de verificação foi enviado para o seu email. Insira-o abaixo para confirmar a operação.</p>
              {error && <p className="saque-message error modal-error">{error}</p>}
              <input type="text" className="modal-input" placeholder="Código de Verificação" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} />
              <div className="modal-actions">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="modal-button cancel" onClick={closeModal} disabled={isLoading}>Cancelar</motion.button>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="modal-button confirm" onClick={handleConfirmWithdraw} disabled={isLoading}>{isLoading ? 'Confirmando...' : 'Confirmar Saque'}</motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Saque;