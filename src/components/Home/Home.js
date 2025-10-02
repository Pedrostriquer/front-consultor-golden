import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import CountUp from 'react-countup';
import consultantService from '../../dbServices/consultantService';
import metaService from '../../dbServices/metaService';
import './Home.css';

import goldenLogo from '../../img/logo-golden-ouro2.png';
import diamondLogo from '../../img/diamond_prime_diamond (1).png';

// --- Funções Auxiliares ---
const formatCurrency = (value, showDecimals = false) => `R$${(value || 0).toLocaleString('pt-BR', { minimumFractionDigits: showDecimals ? 2 : 0, maximumFractionDigits: 2 })}`;
const PlatformLogo = ({ platform }) => <img src={platform === 'Golden Brasil' ? goldenLogo : diamondLogo} alt={platform} className="platform-logo-small" title={platform} />;

const transformChartData = (data = []) => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const currentMonthIndex = new Date().getMonth();
    const lastSixMonths = [...Array(6)].map((_, i) => {
        const monthIndex = (currentMonthIndex - 5 + i + 12) % 12;
        return months[monthIndex];
    });
    return data.map((commission, index) => ({ month: lastSixMonths[index], commission }));
};

const AnimatedProgressBar = ({ value, color }) => (
    <div className="progress-bar-background"><motion.div className="progress-bar-foreground" style={{ backgroundColor: color }} initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 1.5, ease: "easeOut" }} /></div>
);


// --- Componente Principal ---
const Home = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [metaData, setMetaData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isLevelsExpanded, setIsLevelsExpanded] = useState(false);
    const [clientFilter, setClientFilter] = useState('Todos'); // NOVO ESTADO PARA O FILTRO
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [dashboardResponse, metaResponse] = await Promise.all([
                    consultantService.getDashboardData(),
                    metaService.getMetas()
                ]);
                setDashboardData(dashboardResponse);
                setMetaData(metaResponse);
            } catch (error) {
                console.error("Erro ao carregar dados:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const chartData = useMemo(() => transformChartData(dashboardData?.lastSixMonthsCommissions), [dashboardData]);

    const commissionLevels = useMemo(() => {
        if (!metaData || !dashboardData) return null;
        const { metas } = metaData; 
        const currentCommission = dashboardData.actualMonthlyCommission;
        const maxGoal = metas.length > 0 ? metas[metas.length - 1].value : 0;
        let currentLevel = null, nextLevel = metas.length > 0 ? metas[0] : null;
        
        for (let i = metas.length - 1; i >= 0; i--) {
            if (currentCommission >= metas[i].value) {
                currentLevel = metas[i];
                nextLevel = metas[i + 1] || null;
                break;
            }
            nextLevel = metas[i];
        }
        
        const progressStart = currentLevel ? currentLevel.value : 0;
        const progressEnd = nextLevel ? nextLevel.value : maxGoal;
        const progress = (progressEnd - progressStart > 0) 
            ? Math.max(0, Math.min(((currentCommission - progressStart) / (progressEnd - progressStart)) * 100, 100))
            : (currentCommission >= maxGoal ? 100 : 0);
            
        const amountForNextLevel = nextLevel ? nextLevel.value - currentCommission : 0;

        return { levels: metas, currentLevel, nextLevel, progress, maxGoal, amountForNextLevel };
    }, [metaData, dashboardData]);

    // LÓGICA PARA FILTRAR OS CLIENTES
    const filteredClients = useMemo(() => {
        if (!dashboardData?.bestClients) return [];

        // Adiciona uma propriedade 'platform' para simulação, já que a API ainda não a envia.
        const clientsWithPlatform = dashboardData.bestClients.map(client => ({
            ...client,
            platform: 'Golden Brasil' 
        }));

        if (clientFilter === 'Golden') {
            return clientsWithPlatform.filter(client => client.platform === 'Golden Brasil');
        }
        if (clientFilter === 'Diamond') {
            return clientsWithPlatform.filter(client => client.platform === 'Diamond Prime'); // Retornará lista vazia por enquanto
        }
        return clientsWithPlatform; // Caso 'Todos'
    }, [dashboardData, clientFilter]);

    const pageVariants = { initial: { opacity: 0 }, in: { opacity: 1, transition: { staggerChildren: 0.1 } } };
    const itemVariants = { initial: { opacity: 0, y: 20 }, in: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }};

    if (isLoading || !dashboardData) {
        return <div className="loading-placeholder">A carregar dashboard...</div>;
    }

    const { totalClients, actualMonthlyCommission, actualMonthlyPendingCommission, bestClients, totalCommissionEarned } = dashboardData;

    return (
        <motion.div className="home-page" variants={pageVariants} initial="initial" animate="in">
            <motion.div className="stats-grid" variants={itemVariants}>
                <div className="stat-card card-base"><h3><i className="fa-solid fa-users"></i> Total de Clientes</h3><p className="stat-value"><CountUp end={totalClients} duration={1.5} /></p></div>
                <div className="stat-card card-base"><h3><i className="fa-solid fa-hand-holding-dollar"></i> Comissão (Mês)</h3><p className="stat-value"><CountUp end={actualMonthlyCommission} duration={2} prefix="R$ " separator="." decimal="," decimals={2} /></p></div>
                <div className="stat-card card-base"><h3><i className="fa-solid fa-hourglass-half"></i> Comissão Pendente</h3><p className="stat-value"><CountUp end={actualMonthlyPendingCommission} duration={2.5} prefix="R$ " separator="." decimal="," decimals={2} /></p></div>
            </motion.div>

            <motion.div className="main-grid" variants={itemVariants}>
                <div className="chart-container card-base">
                    <div className="card-header"><h3>Comissões Recebidas (Últimos 6 meses)</h3></div>
                    <ResponsiveContainer width="100%" height={300}><BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}><XAxis dataKey="month" stroke="#9CA3AF" /><YAxis stroke="#9CA3AF" tickFormatter={(v) => `R$${v/1000}k`} /><Tooltip cursor={{ fill: 'rgba(246, 209, 104, 0.1)' }} contentStyle={{ backgroundColor: '#1F2A40', border: '1px solid #374151' }} /><Bar dataKey="commission" name="Comissão" fill="#f6d168" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer>
                </div>
                <div className="top-clients-container card-base">
                    {/* CABEÇALHO DO CARD ATUALIZADO COM OS FILTROS */}
                    <div className="card-header">
                        <h3>Melhores Clientes</h3>
                        <div className="client-filter-controls">
                            <button className={clientFilter === 'Todos' ? 'active-filter' : ''} onClick={() => setClientFilter('Todos')}>Todos</button>
                            <button className={clientFilter === 'Golden' ? 'active-filter' : ''} onClick={() => setClientFilter('Golden')}>Golden</button>
                            <button className={clientFilter === 'Diamond' ? 'active-filter' : ''} onClick={() => setClientFilter('Diamond')}>Diamond</button>
                        </div>
                    </div>
                    {/* LISTA DE CLIENTES ATUALIZADA */}
                    <ul className="client-list">
                        {filteredClients.length > 0 ? (
                            filteredClients.slice(0, 5).map((client) => (
                                <li key={client.id} className="client-item">
                                    <div className="client-info">
                                        {/* Número do rank trocado pela logo */}
                                        <div className="client-platform-logo">
                                          <PlatformLogo platform={client.platform} />
                                        </div>
                                        <span>{client.name}</span>
                                    </div>
                                    <span className="client-balance">{formatCurrency(client.totalBalance)}</span>
                                </li>
                            ))
                        ) : (
                            <p className="placeholder-text">Nenhum cliente encontrado para esta plataforma.</p>
                        )}
                    </ul>
                </div>
            </motion.div>
            
            <motion.div className="secondary-grid" variants={itemVariants}>
                 <div className="platform-stats-container card-base">
                    <div className="card-header"><h3><i className="fa-solid fa-chart-pie"></i> Análise de Plataformas</h3></div>
                    <div className="stats-content">
                        <div className="stat-group">
                            <h4>Distribuição de Clientes</h4>
                            <div className="stat-item">
                                <div className="stat-label"><PlatformLogo platform="Golden Brasil" /><span>Golden Brasil</span></div>
                                <span className="stat-percentage">100%</span>
                            </div>
                            <AnimatedProgressBar value={100} color="#f6d168" />
                            <div className="stat-item" style={{marginTop: '1rem'}}>
                                <div className="stat-label"><PlatformLogo platform="Diamond Prime" /><span>Diamond Prime</span></div>
                                <span className="stat-percentage">0%</span>
                            </div>
                            <AnimatedProgressBar value={0} color="#6B7280" />
                        </div>
                        <div className="stat-group">
                            <h4>Total de Comissão Gerada</h4>
                            <div className="stat-item">
                                <div className="stat-label"><PlatformLogo platform="Golden Brasil" /><span>Golden Brasil</span></div>
                                <span className="stat-value-small">{formatCurrency(totalCommissionEarned, true)}</span>
                            </div>
                            <div className="stat-item" style={{marginTop: '0.5rem'}}>
                                <div className="stat-label"><PlatformLogo platform="Diamond Prime" /><span>Diamond Prime</span></div>
                                <span className="stat-value-small">{formatCurrency(0, true)}</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                {commissionLevels && (
                     <motion.div layout className="levels-container card-base" variants={itemVariants}>
                         <motion.div layout className="card-header">
                             <h3><i className="fa-solid fa-layer-group"></i> Níveis de Comissão</h3>
                             <button className="levels-expand-button" onClick={() => setIsLevelsExpanded(!isLevelsExpanded)}>
                                 {isLevelsExpanded ? 'Recolher' : 'Exibir Níveis'} <i className={`fa-solid ${isLevelsExpanded ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
                             </button>
                         </motion.div>
                         <motion.div layout className="progress-summary"><span>Vendas no mês: <strong>{formatCurrency(actualMonthlyCommission, true)}</strong></span>{commissionLevels.nextLevel ? (<span>Próximo nível: <strong>{formatCurrency(commissionLevels.nextLevel.value)}</strong></span>) : (<span>Você atingiu o nível máximo!</span>)}</motion.div>
                         <div className="progress-bar-container">
                             <motion.div className="progress-bar-fill" style={{ transformOrigin: 'left' }} initial={{ scaleX: 0 }} animate={{ scaleX: commissionLevels.progress / 100 }} transition={{ duration: 1.5, ease: "easeOut" }} />
                             {commissionLevels.levels.map(level => {
                                 const percentage = (level.value / commissionLevels.maxGoal) * 100;
                                 const isCompleted = actualMonthlyCommission >= level.value;
                                 return (
                                     <div key={level.value} className={`level-marker ${isCompleted ? 'completed' : ''}`} style={{ left: `calc(10px + (100% - 20px) * ${percentage / 100})` }}>
                                         <div className="marker-dot"></div>
                                         <div className="marker-tooltip">
                                             <span className="tooltip-value">{formatCurrency(level.value)}</span>
                                             <span className="tooltip-commission">{level.commission_percentage}%</span>
                                         </div>
                                     </div>
                                 )}
                             )}
                         </div>
                         {commissionLevels.nextLevel && commissionLevels.amountForNextLevel > 0 && (<p className="next-level-info">Faltam <strong>{formatCurrency(commissionLevels.amountForNextLevel, true)}</strong> para o próximo nível.</p>)}
                         
                         <AnimatePresence>
                             {isLevelsExpanded && (
                                 <motion.div className="expanded-levels-list" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                                     <ul>
                                        {commissionLevels.levels.map((level, index, allLevels) => {
                                            const nextLevel = allLevels[index + 1];
                                            let levelText = '';
                                            if (nextLevel) {
                                                levelText = `De ${formatCurrency(level.value)} a ${formatCurrency(nextLevel.value)} em vendas`;
                                            } else {
                                                levelText = `Acima de ${formatCurrency(level.value)} em vendas`;
                                            }
                                            return (
                                                <li key={level.value} className={commissionLevels.currentLevel?.value === level.value ? 'current' : ''}>
                                                    <span>{levelText}</span>
                                                    <strong>{level.commission_percentage}% de comissão</strong>
                                                </li>
                                            );
                                        })}
                                     </ul>
                                 </motion.div>
                             )}
                         </AnimatePresence>
                    </motion.div>
                )}
            </motion.div>
        </motion.div>
    );
};

export default Home;