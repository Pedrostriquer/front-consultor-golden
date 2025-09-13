import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import consultantService from '../../dbServices/consultantService';
import useDebounce from '../../hooks/useDebounce';
import './Clientes.css';

const formatCurrency = (value) => {
  if (value === null || value === undefined) return "R$ 0,00";
  return `R$${value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const Clientes = () => {
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const fetchClients = useCallback(async (currentPage, search) => {
    setIsLoading(true);
    try {
      const response = await consultantService.searchMyClients(search, currentPage, 10);
      const { items, totalCount, pageSize } = response.data;
      setClients(items);
      setTotalPages(Math.ceil(totalCount / pageSize));
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
      setClients([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClients(page, debouncedSearchTerm);
  }, [page, debouncedSearchTerm, fetchClients]);

  useEffect(() => { setPage(1); }, [debouncedSearchTerm]);

  const handleRowClick = (clientId) => {
    navigate(`/platform/clientes/${clientId}`);
  };

  return (
    <div className="clientes-page">
      <div className="page-header">
        <h1>Meus Clientes</h1>
        <div className="header-actions">
          <div className="search-bar">
            <i className="fa-solid fa-magnifying-glass"></i>
            <input 
              type="text" 
              placeholder="Buscar por nome, CPF, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="table-wrapper card-base">
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>CPF/CNPJ</th>
              <th>Email</th>
              <th>Celular</th>
              <th>Saldo</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan="5" className="text-center">Carregando...</td></tr>
            ) : clients.length > 0 ? (
              clients.map(client => (
                <tr key={client.id} onClick={() => handleRowClick(client.id)}>
                  <td>{client.name}</td>
                  <td>{client.cpfCnpj}</td>
                  <td>{client.email}</td>
                  <td>{client.phoneNumber}</td>
                  <td>{formatCurrency(client.balance)}</td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="5" className="text-center">Nenhum cliente encontrado.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      
      <div className="pagination-controls">
        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
          Anterior
        </button>
        <span>Página {page} de {totalPages || 1}</span>
        <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages || totalPages === 0}>
          Próxima
        </button>
      </div>
    </div>
  );
};

export default Clientes;