import React, { useState, useEffect, useContext } from "react";
import { useAuth } from "../../Context/AuthContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useNavigate } from "react-router-dom";
import consultantService from "../../dbServices/consultantService";
import "./Home.css";

const RoundedBar = (props) => {
  const { x, y, width, height, fill } = props;
  const radius = 8;
  return (
    <path
      d={`M${x},${y + radius} A${radius},${radius} 0 0 1 ${x + radius},${y} L${
        x + width - radius
      },${y} A${radius},${radius} 0 0 1 ${x + width},${y + radius} L${
        x + width
      },${y + height} L${x},${y + height} Z`}
      fill={fill}
    />
  );
};

const formatCurrency = (value) => {
  if (value === null || value === undefined) return "R$ 0,00";
  return `R$${value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const KpiCardSkeleton = () => (
  <div className="card-base kpi-card skeleton">
    <div className="kpi-content">
      <div className="skeleton-text short"></div>
      <div className="skeleton-text long"></div>
    </div>
  </div>
);

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
        console.log('Dados completos da API:', response.data); // ← DEBUG
        console.log('Ranking recebido:', response.data.ranking); // ← DEBUG
        console.log('Info do consultor atual:', response.data.currentConsultantRankInfo); // ← DEBUG
        console.log('Melhores clientes:', response.data.bestClients); // ← DEBUG
        console.log('Dados mensais:', response.data.monthlyCommissionData); // ← DEBUG
        setData(response.data);
      } catch (error) {
        console.error("Erro ao buscar dados do dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    };
    if (user) {
      fetchData();
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="home-container">
        <header className="dashboard-header">
          <h1 className="header-h1">Bem-vindo, {user?.name}!</h1>
          <p className="header-p">Carregando seus dados de desempenho...</p>
        </header>
        <section className="kpi-grid">
          <KpiCardSkeleton />
          <KpiCardSkeleton />
          <KpiCardSkeleton />
          <KpiCardSkeleton />
        </section>
        <section className="main-grid">
          <div className="card-base main-chart-card">
            <div className="skeleton-chart"></div>
          </div>
          <div className="card-base clients-card">
            <h3 className="card-title">Meus Melhores Clientes</h3>
            <ul className="clients-list">
              {[...Array(4)].map((_, i) => (
                <li key={i} className="client-item skeleton">
                  <div className="skeleton-avatar"></div>
                  <div className="client-info">
                    <div className="skeleton-text short"></div>
                    <div className="skeleton-bar"></div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
        <section className="card-base ranking-section">
          <h3 className="card-title">Ranking de Consultores (Vendas no Ano)</h3>
          <ul className="consultant-ranking-list">
            {[...Array(5)].map((_, i) => (
              <li key={i} className="client-item skeleton">
                <div className="skeleton-avatar"></div>
                <div className="client-info">
                  <div className="skeleton-text long"></div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    );
  }

  if (!data)
    return (
      <div className="home-container">
        <p>Não foi possível carregar os dados do dashboard.</p>
      </div>
    );

  const topClientGoal = data.bestClients?.[0]?.totalInvested || 1;
  const isLoggedConsultantInTop5 =
    data.currentConsultantRankInfo && data.currentConsultantRankInfo.rank <= 5;

  const kpiData = [
    { title: "Meus Clientes", value: data.totalClients },
    {
      title: "Comissão Recebida (Mês)",
      value: formatCurrency(data.totalCommissionThisMonth),
    },
    {
      title: "Comissão Pendente (Mês)",
      value: formatCurrency(data.totalPendingCommissionThisMonth),
    },
    {
      title: "Comissão Recebida (Ano)",
      value: formatCurrency(data.totalCommissionThisYear),
    },
  ];

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
          <h3 className="card-title">
            Visão Geral de Comissões Pagas (Últimos 6 meses)
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={data.monthlyCommissionData}
              margin={{ top: 20, right: 20, left: -10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} />
              <YAxis
                tickFormatter={(val) => `R$${val / 1000}k`}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                cursor={{ fill: "transparent" }}
                contentStyle={{
                  background: "rgba(255, 255, 255, 0.7)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  borderRadius: "12px",
                }}
                formatter={(value) => `${formatCurrency(value)}`}
              />
              <Bar
                dataKey="commission"
                name="Comissão Paga"
                shape={<RoundedBar />}
                fill="#3b82f6"
                barSize={30}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card-base clients-card">
          <h3 className="card-title">
            Meus Melhores Clientes (Investimento Ativo)
          </h3>
          <ul className="clients-list">
            {data.bestClients.map((client) => (
              <li
                key={client.clientId}
                className="client-item clickable-row"
                onClick={() =>
                  navigate(`/platform/clientes/${client.clientId}`)
                }
              >
                <div className="client-avatar">
                  {client.profilePictureUrl ? (
                    <img
                      src={client.profilePictureUrl}
                      alt={client.clientName}
                      className="client-avatar-img"
                    />
                  ) : (
                    <>
                      <span style={{fontSize: 18}}>{client.clientName.charAt(0)}</span>
                    </>
                  )}
                </div>
                <div className="client-info">
                  <span className="client-name">{client.clientName}</span>
                  <div className="progress-bar">
                    <div
                      className="progress"
                      style={{
                        width: `${
                          (client.totalInvested / topClientGoal) * 100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
                <span className="client-sales">
                  {formatCurrency(client.totalInvested)}
                </span>
              </li>
            ))}
            {data.bestClients.length === 0 && (
              <p className="placeholder-text">
                Nenhum cliente ativo encontrado.
              </p>
            )}
          </ul>
        </div>
      </section>

      <section className="card-base ranking-section">
        <h3 className="card-title">
          Ranking de Consultores (Vendas Pagas no Ano)
        </h3>
        <ol className="consultant-ranking-list">
          {data.ranking.map((consultant) => (
            <li
              key={consultant.id}
              className={`consultant-item ${
                consultant.id === user.id ? "highlight" : ""
              }`}
            >
              <span className="rank-number">{consultant.rank}º</span>
              <div className="rank-avatar">{consultant.name.charAt(0)}</div>
              <span className="rank-name">{consultant.name}</span>
              <span className="rank-sales">
                {formatCurrency(consultant.totalSales)}
              </span>
            </li>
          ))}
          {!isLoggedConsultantInTop5 && data.currentConsultantRankInfo && (
            <>
              <div className="rank-separator"></div>
              <li className="consultant-item highlight">
                <span className="rank-number">
                  {data.currentConsultantRankInfo.rank}º
                </span>
                <div className="rank-avatar">
                  {data.currentConsultantRankInfo.name.charAt(0)}
                </div>
                <span className="rank-name">
                  {data.currentConsultantRankInfo.name}
                </span>
                <span className="rank-sales">
                  {formatCurrency(data.currentConsultantRankInfo.totalSales)}
                </span>
              </li>
            </>
          )}
          {data.ranking.length === 0 && (
            <p className="placeholder-text">
              Nenhum consultor com vendas pagas este ano.
            </p>
          )}
        </ol>
      </section>
    </div>
  );
};

export default Home;