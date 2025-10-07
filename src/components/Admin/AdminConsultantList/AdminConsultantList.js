import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import adminConsultantService from '../../../dbServices/adminConsultantService';
import adminMetaService from '../../../dbServices/adminMetaService';
import useDebounce from '../../../hooks/useDebounce';
import './AdminConsultantList.css';

// ===================================================================
// =================== COMPONENTE DO MODAL DE METAS ==================
// ===================================================================
const ManageMetasModal = ({ isOpen, onClose }) => {
    const [metas, setMetas] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingMeta, setEditingMeta] = useState(null);
    const [selectedMetaId, setSelectedMetaId] = useState(null);

    const fetchMetas = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await adminMetaService.getMetas();
            setMetas(data || []);
        } catch (error) { console.error("Erro ao carregar metas", error); } 
        finally { setIsLoading(false); }
    }, []);

    useEffect(() => { if (isOpen) { fetchMetas(); } }, [isOpen, fetchMetas]);

    const handleSelectMeta = (meta) => {
        setSelectedMetaId(meta.id);
        setEditingMeta(JSON.parse(JSON.stringify(meta)));
    };

    const handleCreateNew = () => {
        setSelectedMetaId(null);
        setEditingMeta({ name: '', description: '', metas: [{ value: 0, commission_percentage: 0 }] });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditingMeta(prev => ({ ...prev, [name]: value }));
    };

    const handleLevelChange = (index, field, value) => {
        const newLevels = [...editingMeta.metas];
        // Permite que o campo fique vazio temporariamente para digitação
        newLevels[index][field] = value;
        setEditingMeta(prev => ({ ...prev, metas: newLevels }));
    };

    const handleLevelBlur = (index, field, value) => {
        const newLevels = [...editingMeta.metas];
        // Ao sair do campo, formata para número ou 0 se estiver vazio
        newLevels[index][field] = parseFloat(value) || 0;
        setEditingMeta(prev => ({ ...prev, metas: newLevels }));
    };

    const addLevel = () => {
        setEditingMeta(prev => ({ ...prev, metas: [...prev.metas, { value: '', commission_percentage: '' }] }));
    };

    const removeLevel = (index) => {
        if (index === 0) return;
        setEditingMeta(prev => ({ ...prev, metas: prev.metas.filter((_, i) => i !== index) }));
    };

    const handleSave = async () => {
        if (!editingMeta) return;
        try {
            // Garante que todos os valores sejam números antes de salvar
            const sanitizedMeta = {
                ...editingMeta,
                metas: editingMeta.metas.map(level => ({
                    value: parseFloat(level.value) || 0,
                    commission_percentage: parseFloat(level.commission_percentage) || 0
                }))
            };

            if (sanitizedMeta.id) {
                await adminMetaService.updateMeta(sanitizedMeta.id, sanitizedMeta);
            } else {
                await adminMetaService.createMeta(sanitizedMeta);
            }
            setEditingMeta(null);
            setSelectedMetaId(null);
            fetchMetas();
        } catch (error) { console.error("Erro ao salvar meta", error); }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Tem certeza que deseja deletar esta meta?")) {
            try {
                await adminMetaService.deleteMeta(id);
                if (selectedMetaId === id) {
                    setEditingMeta(null);
                    setSelectedMetaId(null);
                }
                fetchMetas();
            } catch (error) { console.error("Erro ao deletar meta", error); }
        }
    };

    const closeModal = () => {
        setEditingMeta(null);
        setSelectedMetaId(null);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <motion.div className="admin-modal-content" initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}>
                        <div className="modal-header">
                            <h2><i className="fa-solid fa-bullseye"></i> Gerenciar Metas</h2>
                            <button onClick={closeModal} className="close-button">&times;</button>
                        </div>
                        <div className="modal-body">
                            <div className="metas-list-panel">
                                <div className="metas-list">
                                    {isLoading ? <p>Carregando...</p> : metas.map(meta => (
                                        <div key={meta.id} className={`meta-list-item ${selectedMetaId === meta.id ? 'active' : ''}`} onClick={() => handleSelectMeta(meta)}>
                                            <span className="meta-name">{meta.name}</span>
                                            <span className="meta-description">{meta.description}</span>
                                        </div>
                                    ))}
                                </div>
                                <button onClick={handleCreateNew} className="btn-new-meta"><i className="fa-solid fa-plus"></i> Criar Nova Meta</button>
                            </div>
                            <div className="meta-edit-panel">
                                {editingMeta ? (
                                    <>
                                        <h3>{editingMeta.id ? `Editando Meta` : 'Nova Meta'}</h3>
                                        <div className="form-group">
                                            <label>Nome da Meta</label>
                                            <input type="text" name="name" value={editingMeta.name} onChange={handleInputChange} />
                                        </div>
                                        <div className="form-group">
                                            <label>Descrição</label>
                                            <input type="text" name="description" value={editingMeta.description} onChange={handleInputChange} />
                                        </div>
                                        <h4 className="level-title">Níveis de Comissão</h4>
                                        {editingMeta.metas.map((level, index) => (
                                            <div className="level-row" key={index}>
                                                <i className="fa-solid fa-layer-group level-icon"></i>
                                                <div className="level-inputs">
                                                    <input type="number" readOnly={index === 0} value={level.value} onChange={(e) => handleLevelChange(index, 'value', e.target.value)} onBlur={(e) => handleLevelBlur(index, 'value', e.target.value)} placeholder="A partir de R$" />
                                                    <input type="number" value={level.commission_percentage} onChange={(e) => handleLevelChange(index, 'commission_percentage', e.target.value)} onBlur={(e) => handleLevelBlur(index, 'commission_percentage', e.target.value)} placeholder="% de Comissão" />
                                                </div>
                                                <button onClick={() => removeLevel(index)} disabled={index === 0} className="btn-remove-level"><i className="fa-solid fa-trash"></i></button>
                                            </div>
                                        ))}
                                        <div className="form-actions">
                                            <button onClick={addLevel} className="btn-add-level"><i className="fa-solid fa-plus"></i> Adicionar Nível</button>
                                            <div>
                                                {editingMeta.id && <button onClick={() => handleDelete(editingMeta.id)} className="btn-delete">Deletar</button>}
                                                <button onClick={handleSave} className="btn-save">Salvar</button>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="placeholder">
                                        <i className="fa-solid fa-list-check"></i>
                                        <p>Selecione uma meta para editar ou crie uma nova.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};


// ===================================================================
// ================ COMPONENTE PRINCIPAL DA PÁGINA ===================
// ===================================================================
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    // ...
    if (totalPages <= 1) return null;
    return (
      <div className="pagination-controls"><button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}><i className="fa-solid fa-arrow-left"></i> Anterior</button><span>Página {currentPage} de {totalPages}</span><button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>Próxima <i className="fa-solid fa-arrow-right"></i></button></div>
    );
};

const AdminConsultantList = () => {
    // ... (toda a lógica do componente principal permanece a mesma)
    const [consultants, setConsultants] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [isMetaModalOpen, setIsMetaModalOpen] = useState(false);
    const itemsPerPage = 10;
    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const fetchConsultants = useCallback(async () => { setIsLoading(true); setError(''); try { const offset = (currentPage - 1) * itemsPerPage; const response = await adminConsultantService.searchConsultants({ offset, limit: itemsPerPage, name: debouncedSearchTerm }); const formattedConsultants = response.consultants.map(item => item.consultant); setConsultants(formattedConsultants); setTotalPages(Math.ceil(response.totalCount / itemsPerPage)); } catch (err) { setError('Falha ao carregar consultores. Tente novamente.'); console.error(err); } finally { setIsLoading(false); } }, [currentPage, debouncedSearchTerm]);
    useEffect(() => { fetchConsultants(); }, [fetchConsultants]);
    useEffect(() => { setCurrentPage(1); }, [debouncedSearchTerm]);
    const handleRowClick = (consultantId) => navigate(`/admin/consultor/${consultantId}`);
    const handleManageMetas = () => setIsMetaModalOpen(true);
    const rowVariants = { hidden: { opacity: 0, y: 20 }, visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.3, ease: 'easeOut' } }), exit: { opacity: 0, transition: { duration: 0.2 } }, };

    return (
        <>
            <div className="admin-home-page">
                <div className="admin-page-header">
                    <div><h1>Consultores</h1><p>Gerencie e visualize os dados dos consultores cadastrados.</p></div>
                    <div className="header-actions"><button className="manage-metas-button" onClick={handleManageMetas}><i className="fa-solid fa-bullseye"></i> Gerenciar Metas</button></div>
                </div>
                <div className="admin-filters-container card-base"><div className="admin-search-bar"><i className="fa-solid fa-search"></i><input type="text" placeholder="Buscar por nome do consultor..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div></div>
                <div className="admin-table-wrapper card-base">
                    <table>
                        <thead><tr><th>ID</th><th>Nome</th><th>Email</th><th>% Comissão</th></tr></thead>
                        <tbody>
                            <AnimatePresence>
                                {isLoading ? ([...Array(itemsPerPage)].map((_, i) => (<tr key={i} className="skeleton-row">{[...Array(4)].map((_, j) => <td key={j}><div className="skeleton-bar"></div></td>)}</tr>))) : error ? (<tr><td colSpan="4" className="empty-state error-message">{error}</td></tr>) : consultants.length > 0 ? (consultants.map((consultor, index) => (<motion.tr key={consultor.id} custom={index} variants={rowVariants} initial="hidden" animate="visible" exit="exit" layout className="clickable-row" onClick={() => handleRowClick(consultor.id)}><td>#{consultor.id}</td><td>{consultor.name}</td><td>{consultor.email}</td><td>{consultor.commissionPercentage}%</td></motion.tr>))) : (<tr><td colSpan="4" className="empty-state">Nenhum consultor encontrado.</td></tr>)}
                            </AnimatePresence>
                        </tbody>
                    </table>
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                </div>
            </div>
            <ManageMetasModal isOpen={isMetaModalOpen} onClose={() => setIsMetaModalOpen(false)} />
        </>
    );
};

export default AdminConsultantList;