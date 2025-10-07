import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import adminConsultantService from '../../../dbServices/adminConsultantService';
import adminMetaService from '../../../dbServices/adminMetaService';
import './ConsultantDetailPage.css';

// --- Funções Auxiliares ---
const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("pt-BR", { day: '2-digit', month: '2-digit', year: 'numeric' });
};
const formatCurrency = (value) => `R$${(typeof value === 'number' ? value : 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const getStatusBadge = (status) => {
    const map = {
      PENDENTE: { text: "Pendente", className: "status-pending" },
      VENDIDO: { text: "Vendido", className: "status-active" },
      RECEBIDO: { text: "Recebido", className: "status-completed" },
      CANCELADO: { text: "Cancelado", className: "status-canceled" },
    };
    const { text, className } = map[String(status).toUpperCase()] || { text: status, className: "status-default" };
    return <span className={`status-badge ${className}`}>{text}</span>;
};

// --- COMPONENTE PRINCIPAL ---
const ConsultantDetailPage = () => {
    const { consultantId } = useParams();
    const navigate = useNavigate();
    
    // Estados dos Dados
    const [consultant, setConsultant] = useState(null);
    const [sales, setSales] = useState(null);
    const [clients, setClients] = useState(null);
    const [allMetas, setAllMetas] = useState([]);
    
    // Estados da UI
    const [isLoading, setIsLoading] = useState(true);
    const [isDataLoading, setIsDataLoading] = useState(false);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('sales');
    
    const [isMetaModalOpen, setIsMetaModalOpen] = useState(false);
    const [editingMeta, setEditingMeta] = useState(null);

    const fetchConsultantData = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await adminConsultantService.getConsultantById(consultantId);
            setConsultant(data);
        } catch (err) { 
            setError("Falha ao carregar dados do consultor."); 
            console.error(err);
        } finally { 
            setIsLoading(false); 
        }
    }, [consultantId]);

    useEffect(() => {
        fetchConsultantData();
    }, [fetchConsultantData]);

    const handleLoadData = useCallback(async () => {
        if (!consultantId) return;
        setIsDataLoading(true);
        try {
            if (activeTab === 'sales') {
                const salesData = await adminConsultantService.getConsultantSales({ consultantId });
                setSales(salesData.sales || []);
            } else if (activeTab === 'clients') {
                const clientsData = await adminConsultantService.getConsultantClients({ consultantId });
                setClients(clientsData || []);
            }
        } catch (err) {
            console.error(`Erro ao carregar ${activeTab}:`, err);
            // Poderia-se setar um erro específico para a tabela aqui
        } finally {
            setIsDataLoading(false);
        }
    }, [consultantId, activeTab]);
    
    // Zera os dados da tabela ao trocar de aba para forçar o recarregamento
    useEffect(() => {
        setSales(null);
        setClients(null);
    }, [activeTab]);

    const handleOpenMetaModal = async () => {
        try {
            const metasData = await adminMetaService.getMetas();
            setAllMetas(metasData || []);
            setEditingMeta(consultant.meta ? JSON.parse(JSON.stringify(consultant.meta)) : null);
            setIsMetaModalOpen(true);
        } catch (err) { console.error("Erro ao carregar metas", err); }
    };

    const handleSelectMetaForEditing = (meta) => {
        setEditingMeta(JSON.parse(JSON.stringify(meta)));
    };

    const handleLevelChange = (index, field, value) => {
        const newLevels = [...editingMeta.metas];
        newLevels[index][field] = value;
        setEditingMeta(prev => ({ ...prev, metas: newLevels }));
    };

    const handleLevelBlur = (index, field, value) => {
        const newLevels = [...editingMeta.metas];
        newLevels[index][field] = parseFloat(value) || 0;
        setEditingMeta(prev => ({ ...prev, metas: newLevels }));
    };

    const handleUpdateMetaDetails = async () => {
        if (!editingMeta) return;
        try {
            const sanitizedMeta = { ...editingMeta, metas: editingMeta.metas.map(l => ({...l, value: parseFloat(l.value) || 0, commission_percentage: parseFloat(l.commission_percentage) || 0 }))};
            await adminMetaService.updateMeta(sanitizedMeta.id, sanitizedMeta);
            await fetchConsultantData(); 
            const metasData = await adminMetaService.getMetas();
            setAllMetas(metasData || []);
            alert("Meta atualizada com sucesso!");
        } catch(err) { console.error("Erro ao atualizar meta", err); }
    };

    const handleAssignMetaToConsultant = async (metaId) => {
        try {
            await adminConsultantService.associateMetaToConsultant(consultantId, metaId);
            await fetchConsultantData();
            setIsMetaModalOpen(false);
        } catch (err) { console.error("Erro ao associar meta", err); }
    };

    if (isLoading) return <div className="consultant-detail-loading">Carregando...</div>;
    if (error) return <div className="consultant-detail-error">{error}</div>;
    if (!consultant) return null;

    const currentData = activeTab === 'sales' ? sales : clients;

    return (
        <>
            <motion.div className="consultant-detail-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <button onClick={() => navigate('/admin/consultores')} className="back-button"><i className="fa-solid fa-arrow-left"></i> Voltar</button>
                <div className="consultant-header card-base">
                    <div className="consultant-info"><h1>{consultant.name}</h1><p>{consultant.email}</p></div>
                </div>
                <div className="consultant-details-grid">
                    <div className="details-card card-base"><h3><i className="fa-solid fa-user-tie"></i> Informações</h3><ul><li><span>CPF/CNPJ</span> <strong>{consultant.cpfCnpj}</strong></li><li><span>Telefone</span> <strong>{consultant.phoneNumber}</strong></li></ul></div>
                    <div className="details-card card-base">
                        <h3><i className="fa-solid fa-bullseye"></i> Meta do Consultor</h3>
                        <div className="meta-info">
                            <strong>{consultant.meta ? consultant.meta.name : 'Nenhuma meta associada'}</strong>
                            <p>{consultant.meta ? consultant.meta.description : 'Associe uma meta a este consultor.'}</p>
                            <button className="change-meta-btn" onClick={handleOpenMetaModal}><i className="fa-solid fa-gear"></i> Gerenciar Meta</button>
                        </div>
                    </div>
                </div>

                <div className="data-table-container card-base">
                    <div className="table-tabs">
                        <button className={`tab-button ${activeTab === 'sales' ? 'active' : ''}`} onClick={() => setActiveTab('sales')}>
                            <i className="fa-solid fa-file-invoice-dollar"></i> Vendas
                        </button>
                        <button className={`tab-button ${activeTab === 'clients' ? 'active' : ''}`} onClick={() => setActiveTab('clients')}>
                            <i className="fa-solid fa-users"></i> Clientes
                        </button>
                    </div>
                    <div className="table-content">
                        {currentData === null ? (
                            <div className="load-data-prompt">
                                <button onClick={handleLoadData} disabled={isDataLoading}>
                                    {isDataLoading ? 'Carregando...' : `Carregar ${activeTab === 'sales' ? 'Vendas' : 'Clientes'}`}
                                </button>
                            </div>
                        ) : (
                            <AnimatePresence mode="wait">
                                <motion.div key={activeTab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                    {activeTab === 'sales' ? (
                                        <table>
                                            <thead><tr><th>ID Venda</th><th>Cliente</th><th>Valor</th><th>Data</th><th>Status</th></tr></thead>
                                            <tbody>
                                                {sales.length > 0 ? sales.map(sale => (
                                                    <tr key={sale.id}><td>#{sale.id}</td><td>{sale.clientName}</td><td>{formatCurrency(sale.value)}</td><td>{formatDate(sale.dateCreated)}</td><td>{getStatusBadge(sale.status)}</td></tr>
                                                )) : <tr><td colSpan="5" className="empty-message">Nenhuma venda encontrada.</td></tr>}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <table>
                                            <thead><tr><th>Nome</th><th>CPF/CNPJ</th><th>Email</th><th>Plataforma</th></tr></thead>
                                            <tbody>
                                                {clients.length > 0 ? clients.map(client => (
                                                    <tr key={`${client.cpfCnpj}-${client.platformId}`}><td>{client.name}</td><td>{client.cpfCnpj}</td><td>{client.email || 'N/A'}</td><td>{client.platformId}</td></tr>
                                                )) : <tr><td colSpan="4" className="empty-message">Nenhum cliente encontrado.</td></tr>}
                                            </tbody>
                                        </table>
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        )}
                    </div>
                </div>
            </motion.div>
            
            <AnimatePresence>
                {isMetaModalOpen && (
                    <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <motion.div className="admin-modal-content" initial={{ y: 50 }} animate={{ y: 0 }} exit={{ y: 50 }}>
                            <div className="modal-header"><h2><i className="fa-solid fa-gear"></i> Gerenciar Meta de {consultant.name}</h2><button onClick={() => setIsMetaModalOpen(false)} className="close-button">&times;</button></div>
                            <div className="modal-body">
                                <div className="metas-list-panel">
                                    <h3>Metas Disponíveis</h3>
                                    <div className="metas-list">
                                        {allMetas.map(meta => (
                                            <div key={meta.id} className={`meta-list-item ${editingMeta?.id === meta.id ? 'active' : ''}`} onClick={() => handleSelectMetaForEditing(meta)}>
                                                <div>
                                                    <span className="meta-name">{meta.name}</span>
                                                    <span className="meta-description">{meta.description}</span>
                                                </div>
                                                {consultant.metaId === meta.id && <span className="current-tag">Atual</span>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="meta-edit-panel">
                                    {editingMeta ? (
                                        <>
                                            <h3>Detalhes da Meta</h3>
                                            <div className="form-group"><label>Nome da Meta</label><input type="text" value={editingMeta.name} onChange={(e) => setEditingMeta(p => ({...p, name: e.target.value}))} /></div>
                                            <div className="form-group"><label>Descrição</label><input type="text" value={editingMeta.description} onChange={(e) => setEditingMeta(p => ({...p, description: e.target.value}))} /></div>
                                            <h4 className="level-title">Níveis de Comissão</h4>
                                            {editingMeta.metas.map((level, index) => (
                                                <div className="level-row" key={index}>
                                                    <i className="fa-solid fa-layer-group level-icon"></i>
                                                    <div className="level-inputs">
                                                        <input type="number" readOnly={index === 0} value={level.value} onChange={(e) => handleLevelChange(index, 'value', e.target.value)} onBlur={(e) => handleLevelBlur(index, 'value', e.target.value)} placeholder="A partir de R$" />
                                                        <input type="number" value={level.commission_percentage} onChange={(e) => handleLevelChange(index, 'commission_percentage', e.target.value)} onBlur={(e) => handleLevelBlur(index, 'commission_percentage', e.target.value)} placeholder="% de Comissão" />
                                                    </div>
                                                </div>
                                            ))}
                                            <div className="form-actions">
                                                <button onClick={handleUpdateMetaDetails} className="btn-secondary">Salvar Alterações na Meta</button>
                                                <button onClick={() => handleAssignMetaToConsultant(editingMeta.id)} className="btn-save">Associar esta Meta</button>
                                            </div>
                                        </>
                                    ) : <div className="placeholder"><i className="fa-solid fa-arrow-left"></i><p>Selecione uma meta na lista para ver os detalhes ou associar ao consultor.</p></div>}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default ConsultantDetailPage;