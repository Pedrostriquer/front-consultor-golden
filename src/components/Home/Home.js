import React, { useState, useEffect } from "react";
import { useAuth } from "../../Context/AuthContext";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { useNavigate } from "react-router-dom";
import consultantService from "../../dbServices/consultantService";
import "./Home.css";

// Componente para criar as barras do gráfico com cantos arredondados
const RoundedBar = (props) => {
  const { x, y, width, height, fill } = props;
  const radius = 8;
  return (
    <path
      d={`M${x},${y + radius} A${radius},${radius} 0 0 1 ${x + radius},${y} L${x + width - radius},${y} A${radius},${radius} 0 0 1 ${x + width},${y + radius} L${x + width},${y + height} L${x},${y + height} Z`}
      fill={fill}
    />
  );
};

// Função para formatar números como moeda brasileira (BRL)
const formatCurrency = (value) => {
  if (value === null || value === undefined) return "R$ 0,00";
  return `R$${value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// Componente para o efeito de "esqueleto" enquanto os cards de KPI carregam
const KpiCardSkeleton = () => (
    <div className="card-base kpi-card skeleton">
        <div className="kpi-content"><div className="skeleton-text short"></div><div className="skeleton-text long"></div></div>
    </div>
);


// --- COMPONENTE PRINCIPAL DA PÁGINA HOME ---

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await consultantService.getDashboardData();
        setData(response.data);
      } catch (error) {
        console.error("Erro ao buscar dados do dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    };
    if (user) fetchData();
  }, [user]);

  // Renderiza a estrutura da página com "esqueletos" enquanto os dados carregam
  if (isLoading) {
    return (
      <div className="home-container">
        <header className="dashboard-header">
          <h1 className="header-h1">Bem-vindo, {user?.name}!</h1>
          <p className="header-p">Carregando seus dados de desempenho...</p>
        </header>
        <section className="kpi-grid">
          <KpiCardSkeleton /><KpiCardSkeleton /><KpiCardSkeleton /><KpiCardSkeleton />
        </section>
        <section className="main-grid">
          <div className="card-base main-chart-card"><div className="skeleton-chart"></div></div>
          <div className="card-base clients-card">
            <h3 className="card-title">Meus Melhores Clientes</h3>
            <div className="top-clients-list-skeleton">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="client-item-skeleton">
                        <div className="skeleton-avatar"></div>
                        <div className="skeleton-text-group">
                            <div className="skeleton-text short" style={{height: '16px', width: '70%'}}></div>
                            <div className="skeleton-text short" style={{height: '12px', width: '50%'}}></div>
                            <div className="skeleton-text long" style={{height: '20px', width: '80%', marginTop: '4px'}}></div>
                        </div>
                    </div>
                ))}
            </div>
          </div>
        </section>
        <section className="card-base ranking-section">
          <h3 className="card-title">Ranking de Consultores (Vendas no Ano)</h3>
          <ul className="consultant-ranking-list">
            {[...Array(5)].map((_, i) => ( <li key={i} className="client-item skeleton"><div className="skeleton-avatar"></div><div className="client-info"><div className="skeleton-text long"></div></div></li> ))}
          </ul>
        </section>
      </div>
    );
  }

  // Mensagem de erro se os dados não puderem ser carregados
  if (!data) return <div className="home-container"><p>Não foi possível carregar os dados do dashboard.</p></div>;

  const isLoggedConsultantInTop5 = data.currentConsultantRankInfo && data.currentConsultantRankInfo.rank <= 5;

  const kpiData = [
    { title: "Meus Clientes", value: data.totalClients },
    { title: "Comissão Recebida (Mês)", value: formatCurrency(data.totalCommissionThisMonth) },
    { title: "Comissão Pendente (Mês)", value: formatCurrency(data.totalPendingCommissionThisMonth) },
    { title: "Comissão Recebida (Ano)", value: formatCurrency(data.totalCommissionThisYear) },
  ];

  // Pega apenas os 3 primeiros clientes da lista
  const topClients = data.bestClients.slice(0, 3);

  const getInitials = (name) => (name ? name.charAt(0).toUpperCase() : "");

  return (
    <div className="home-container">
      <header className="dashboard-header">
        <h1 className="header-h1">Bem-vindo, {user?.name}!</h1>
        <p className="header-p">Aqui está um resumo do seu desempenho.</p>
      </header>

      <section className="kpi-grid">
        {kpiData.map((kpi, index) => (
          <div key={index} className="card-base kpi-card">
            <div className="kpi-content">
              <span className="kpi-title">{kpi.title}</span>
              <span className="kpi-value">{kpi.value}</span>
            </div>
          </div>
        ))}
      </section>

      <section className="main-grid">
        <div className="card-base main-chart-card">
            <h3 className="card-title">Visão Geral de Comissões Pagas (Últimos 6 meses)</h3>
            <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data.monthlyCommissionData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: '#A0AEC0' }} />
                <YAxis tickFormatter={(val) => `R$${val / 1000}k`} tickLine={false} axisLine={false} tick={{ fill: '#A0AEC0' }} />
                <Tooltip
                    cursor={{ fill: "rgba(246, 209, 104, 0.1)" }}
                    contentStyle={{ background: "rgba(31, 41, 55, 0.8)", backdropFilter: "blur(10px)", border: "1px solid rgba(246, 209, 104, 0.3)", borderRadius: "12px", color: '#F7FAFC' }}
                    formatter={(value) => `${formatCurrency(value)}`}
                />
                <Bar dataKey="commission" name="Comissão Paga" shape={<RoundedBar />} fill="#f6d168" barSize={30} />
            </BarChart>
            </ResponsiveContainer>
        </div>
        
        <div className="card-base clients-card">
          <h3 className="card-title">Meus Melhores Clientes (Investimento Ativo)</h3>
          {topClients.length > 0 ? (
            <ol className="top-clients-list">
              {topClients.map((client, index) => (
                <li 
                  key={client.clientId} 
                  className="top-client-item"
                  onClick={() => navigate(`/platform/clientes/${client.clientId}`)}
                >
                  <span className="client-rank">{index + 1}</span>
                  <div className="client-avatar">{getInitials(client.clientName)}</div>
                  {/* Container para os detalhes verticais */}
                  <div className="client-details">
                    <span className="client-name">{client.clientName}</span>
                    {/* Renderiza o CPF se ele existir nos dados */}
                    {client.cpfCnpj && (
                      <span className="client-cpf">{client.cpfCnpj}</span>
                    )}
                    <span className="client-value">{formatCurrency(client.totalInvested)}</span>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <p className="placeholder-text">Nenhum cliente ativo encontrado.</p>
          )}
        </div>
      </section>

      <section className="card-base ranking-section">
        <h3 className="card-title">Ranking de Consultores (Vendas Pagas no Ano)</h3>
        <ol className="consultant-ranking-list">
            {data.ranking.map((consultant) => (
            <li key={consultant.id} className={`consultant-item ${ consultant.id === user.id ? "highlight" : "" }`}>
                <span className="rank-number">{consultant.rank}º</span>
                <div className="rank-avatar">{consultant.name.charAt(0)}</div>
                <span className="rank-name">{consultant.name}</span>
                <span className="rank-sales">{formatCurrency(consultant.totalSales)}</span>
            </li>
            ))}
            {!isLoggedConsultantInTop5 && data.currentConsultantRankInfo && (
            <>
                <div className="rank-separator"></div>
                <li className="consultant-item highlight">
                <span className="rank-number">{data.currentConsultantRankInfo.rank}º</span>
                <div className="rank-avatar">{data.currentConsultantRankInfo.name.charAt(0)}</div>
                <span className="rank-name">{data.currentConsultantRankInfo.name}</span>
                <span className="rank-sales">{formatCurrency(data.currentConsultantRankInfo.totalSales)}</span>
                </li>
            </>
            )}
            {data.ranking.length === 0 && ( <p className="placeholder-text">Nenhum consultor com vendas pagas este ano.</p> )}
        </ol>
      </section>
    </div>
  );
};

export default Home;