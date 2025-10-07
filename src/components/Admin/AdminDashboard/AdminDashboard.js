import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import adminDashboardService from '../../../dbServices/adminDashboardService';
import './AdminDashboard.css';

const formatCurrency = (value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const getRankText = (index) => {
    const position = index + 1;
    return `${position}º Lugar`;
};

const AdminDashboard = () => {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const metrics = await adminDashboardService.getDashboardMetrics();
                setData(metrics);
            } catch (err) {
                setError('Não foi possível carregar os dados do dashboard.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const chartData = useMemo(() => {
        if (!data) return [];
        return data.monthlySalesLast12Months.map(item => ({
            name: item.monthYear.split('/')[0].substring(0, 3),
            Vendas: item.totalValue,
        }));
    }, [data]);

    const rankingData = useMemo(() => {
        if (!data) return [];
        return [...data.salesByConsultantCurrentYear].sort((a, b) => b.totalValue - a.totalValue);
    }, [data]);

    if (isLoading) return <div className="admin-dashboard-loader">Carregando...</div>;
    if (error) return <div className="admin-dashboard-error">{error}</div>;

    return (
        <div className="admin-dashboard-page">
            <h1>Dashboard Geral</h1>

            <motion.div className="ranking-container-full card-base" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h3>Ranking de Consultores (Ano)</h3>
                
                {/* Cabeçalho da lista do ranking */}
                <div className="ranking-header">
                    <span>Posição</span>
                    <span>Consultor</span>
                    <span>Total de Vendas</span>
                </div>
                
                <ul>
                    {rankingData.map((consultant, index) => (
                        <li key={consultant.consultantId}>
                            <div className={`rank-position-text rank-${index + 1}`}>
                                {getRankText(index)}
                            </div>
                            <span className="consultant-name">{consultant.consultantName}</span>
                            <span className="consultant-sales">{formatCurrency(consultant.totalValue)}</span>
                        </li>
                    ))}
                </ul>
            </motion.div>

            <div className="main-grid-reordered">
                <div className="chart-container card-base">
                    <h3>Vendas nos Últimos 12 Meses</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="name" stroke="#9CA3AF" />
                            <YAxis stroke="#9CA3AF" tickFormatter={(value) => `R$${value / 1000}k`} />
                            <Tooltip
                                cursor={{ fill: 'rgba(79, 70, 229, 0.1)' }}
                                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                            />
                            <Bar dataKey="Vendas" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Card único que agora contém os dois totais */}
                <div className="stat-card-combined card-base">
                    <div className="stat-item">
                        <h3><i className="fa-solid fa-dollar-sign"></i> Total Vendido (Mês)</h3>
                        <p className="stat-value">
                            <CountUp end={data.totalSoldCurrentMonth} duration={2} prefix="R$ " separator="." decimal="," decimals={2} />
                        </p>
                    </div>
                    <div className="stat-item">
                        <h3><i className="fa-solid fa-hourglass-half"></i> Total Pendente (Mês)</h3>
                        <p className="stat-value pending">
                            <CountUp end={data.totalPendingCurrentMonth} duration={2} prefix="R$ " separator="." decimal="," decimals={2} />
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;