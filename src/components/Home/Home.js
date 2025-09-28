import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import CountUp from 'react-countup';
import consultantService from '../../dbServices/consultantService';
import './Home.css';

import goldenLogo from '../../img/logo-golden-ouro2.png';
import diamondLogo from '../../img/diamond_prime_diamond (1).png';

// --- Funções Auxiliares e Componentes de UI ---

const formatCurrency = (value) => `R$${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const PlatformLogo = ({ platform }) => <img src={platform === 'Golden Brasil' ? goldenLogo : diamondLogo} alt={platform} className="platform-logo-small" title={platform} />;

const AnimatedProgressBar = ({ value, color }) => (
    <div className="progress-bar-background">
        <motion.div
            className="progress-bar-foreground"
            style={{ backgroundColor: color }}
            initial={{ width: 0 }}
            animate={{ width: `${value}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
        />
    </div>
);

// --- Componente Principal ---

const Home = () => {
    // 1. Hooks são sempre chamados no topo, na mesma ordem.
    const [dashboardData, setDashboardData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [bestClientsFilter, setBestClientsFilter] = useState('all');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            // Não resetamos o loading aqui para evitar piscar a tela
            try {
                const response = await consultantService.getDashboardData();
                setDashboardData(response.data);
            } catch (error) {
                console.error("Erro ao carregar dados da dashboard:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredBestClients = useMemo(() => {
        if (!dashboardData) return [];
        if (bestClientsFilter === 'all') {
            return dashboardData.bestClients.slice(0, 5);
        }
        return dashboardData.bestClients.filter(client => client.platform === bestClientsFilter).slice(0, 5);
    }, [dashboardData, bestClientsFilter]);

    const pageVariants = {
        initial: { opacity: 0 },
        in: { opacity: 1, transition: { staggerChildren: 0.1, duration: 0.3 } },
        out: { opacity: 0 },
    };

    const itemVariants = {
        initial: { opacity: 0, y: 20 },
        in: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
    };

    // 2. A lógica de renderização condicional vai para dentro do JSX.
    // Não há mais um "return" antecipado.
    return (
        <motion.div className="home-page" variants={pageVariants} initial="initial" animate="in" exit="out">
            {isLoading || !dashboardData ? (
                <div className="loading-placeholder">Carregando dashboard...</div>
            ) : (
                <>
                    <motion.div className="stats-grid" variants={itemVariants}>
                        <div className="stat-card card-base">
                            <h3><i className="fa-solid fa-users"></i> Total de Clientes</h3>
                            <p className="stat-value"><CountUp end={dashboardData.totalClients} duration={1.5} /></p>
                        </div>
                        <div className="stat-card card-base">
                            <h3><i className="fa-solid fa-hand-holding-dollar"></i> Comissão (Mês)</h3>
                            <p className="stat-value"><CountUp end={dashboardData.totalCommissionThisMonth} duration={2} prefix="R$" separator="." decimal="," decimals={2} /></p>
                        </div>
                        <div className="stat-card card-base">
                            <h3><i className="fa-solid fa-hourglass-half"></i> Comissão Pendente</h3>
                            <p className="stat-value"><CountUp end={dashboardData.totalPendingCommissionThisMonth} duration={2.5} prefix="R$" separator="." decimal="," decimals={2} /></p>
                        </div>
                    </motion.div>

                    <motion.div className="main-grid" variants={itemVariants}>
                        <div className="chart-container card-base">
                            <div className="card-header">
                                <h3>Comissões Recebidas (Últimos 6 meses)</h3>
                            </div>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={dashboardData.monthlyCommissionData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <XAxis dataKey="month" stroke="#9CA3AF" />
                                    <YAxis stroke="#9CA3AF" tickFormatter={(value) => `R$${value/1000}k`} />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(246, 209, 104, 0.1)' }}
                                        contentStyle={{ backgroundColor: '#1F2A40', border: '1px solid #374151', borderRadius: '8px' }}
                                        labelStyle={{ color: '#F9FAFB' }}
                                    />
                                    <Bar dataKey="commission" name="Comissão" fill="#f6d168" radius={[4, 4, 0, 0]}>
                                        {dashboardData.monthlyCommissionData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={index === dashboardData.monthlyCommissionData.length - 1 ? "#f6d168" : "#A38A4A"} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="top-clients-container card-base">
                            <div className="card-header">
                                <h3>Meus Melhores Clientes</h3>
                                <div className="platform-filter">
                                    <select value={bestClientsFilter} onChange={(e) => setBestClientsFilter(e.target.value)}>
                                        <option value="all">Todas</option>
                                        <option value="Golden Brasil">Golden Brasil</option>
                                        <option value="Diamond Prime">Diamond Prime</option>
                                    </select>
                                </div>
                            </div>
                            <ul className="client-list">
                                <AnimatePresence>
                                    {filteredBestClients.map((client, index) => (
                                        <motion.li key={client.id} className="client-item" onClick={() => navigate(`/platform/clientes/${client.id}`)}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            transition={{ duration: 0.3, delay: index * 0.05 }}
                                        >
                                            <div className="client-info">
                                                <PlatformLogo platform={client.platform} />
                                                <span>{client.name}</span>
                                            </div>
                                            <span className="client-balance">{formatCurrency(client.balance)}</span>
                                        </motion.li>
                                    ))}
                                </AnimatePresence>
                            </ul>
                        </div>
                    </motion.div>
                    
                    <motion.div className="secondary-grid" variants={itemVariants}>
                        <div className="ranking-container card-base">
                            <div className="card-header">
                                <h3><i className="fa-solid fa-trophy"></i> Rank de Consultores</h3>
                            </div>
                            <ul className="ranking-list">
                              {dashboardData.ranking.slice(0, 5).map(consultor => (
                                <li key={consultor.id} className={`ranking-item ${consultor.id === dashboardData.currentConsultantRankInfo.id ? 'current-consultant' : ''}`}>
                                  <span className="consultant-rank">#{consultor.rank}</span>
                                  <span className="consultant-name">{consultor.name}</span>
                                  {consultor.id === dashboardData.currentConsultantRankInfo.id && <span className="you-badge">Você</span>}
                                </li>
                              ))}
                            </ul>
                        </div>

                        <div className="platform-stats-container card-base">
                            <div className="card-header">
                                <h3><i className="fa-solid fa-chart-pie"></i> Análise de Plataformas</h3>
                            </div>
                            <div className="stats-content">
                                <div className="stat-group">
                                    <h4>Distribuição de Clientes</h4>
                                    <div className="stat-item">
                                        <div className="stat-label">
                                            <PlatformLogo platform="Golden Brasil" />
                                            <span>Golden Brasil</span>
                                        </div>
                                        <span className="stat-percentage">{dashboardData.platformStats.clientDistribution.golden.toFixed(1)}%</span>
                                    </div>
                                    <AnimatedProgressBar value={dashboardData.platformStats.clientDistribution.golden} color="#f6d168" />
                                    
                                    <div className="stat-item">
                                        <div className="stat-label">
                                            <PlatformLogo platform="Diamond Prime" />
                                            <span>Diamond Prime</span>
                                        </div>
                                        <span className="stat-percentage">{dashboardData.platformStats.clientDistribution.diamond.toFixed(1)}%</span>
                                    </div>
                                    <AnimatedProgressBar value={dashboardData.platformStats.clientDistribution.diamond} color="#7dd3fc" />
                                </div>
                                <div className="stat-group">
                                    <h4>Total de Comissão Gerada</h4>
                                    <div className="stat-item">
                                        <div className="stat-label">
                                            <PlatformLogo platform="Golden Brasil" />
                                            <span>Golden Brasil</span>
                                        </div>
                                        <span className="stat-value-small">{formatCurrency(dashboardData.platformStats.totalCommission.golden)}</span>
                                    </div>
                                    <div className="stat-item">
                                        <div className="stat-label">
                                            <PlatformLogo platform="Diamond Prime" />
                                            <span>Diamond Prime</span>
                                        </div>
                                        <span className="stat-value-small">{formatCurrency(dashboardData.platformStats.totalCommission.diamond)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </motion.div>
    );
};

export default Home;