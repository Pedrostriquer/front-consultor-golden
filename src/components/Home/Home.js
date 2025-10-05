import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import CountUp from "react-countup";
import "./Home.css";

// --- SERVIÇOS ---
import { dashboardSocketService } from "../../dbServices/dashboardSocketService";
import dashboardService from "../../dbServices/dashboardService";
import { useAuth } from "../../Context/AuthContext";
import metaService from "../../dbServices/metaService";

// --- ASSETS ---
import goldenLogo from "../../img/logo-golden-ouro2.png";
import diamondLogo from "../../img/diamond_prime_diamond (1).png";

// --- COMPONENTES AUXILIARES ---
const SkeletonLoader = ({ className = "", style = {} }) => (
  <div className={`skeleton-loader ${className}`} style={style}></div>
);

const formatCurrency = (value = 0, showDecimals = false) =>
  `R$ ${value.toLocaleString("pt-BR", {
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  })}`;

const PlatformLogo = ({ platformId }) => (
  <img
    src={platformId === 1 ? goldenLogo : diamondLogo}
    alt={platformId === 1 ? "Golden Brasil" : "Diamond Prime"}
    className="platform-logo-small"
    title={platformId === 1 ? "Golden Brasil" : "Diamond Prime"}
  />
);

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

// --- COMPONENTE PRINCIPAL ---
const Home = () => {
  const { user } = useAuth();

  // Estados
  const [commissionData, setCommissionData] = useState(null);
  const [historicalData, setHistoricalData] = useState(null);
  const [clientCount, setClientCount] = useState(null);
  const [clientsByPlatform, setClientsByPlatform] = useState(null);
  const [topClients, setTopClients] = useState(null);
  const [metaData, setMetaData] = useState(null);
  const [error, setError] = useState(null);
  const [salesByPlatform, setSalesByPlatform] = useState(null);

  const [isLevelsExpanded, setIsLevelsExpanded] = useState(true);
  const [clientFilter, setClientFilter] = useState("Todos");

  useEffect(() => {
    let isMounted = true;
    if (!user) return;

    const setupAndFetch = async () => {
      // Registra os listeners
      dashboardSocketService.registerListener(
        "ReceiveCommissionData",
        (data) => {
          if (isMounted) setCommissionData(data);
        }
      );
      dashboardSocketService.registerListener(
        "ReceiveHistoricalCommissions",
        (data) => {
          if (isMounted) setHistoricalData(data);
        }
      );
      dashboardSocketService.registerListener("ReceiveTotalClients", (data) => {
        if (isMounted) setClientCount(data.totalClientCount);
      });
      dashboardSocketService.registerListener(
        "ReceiveClientsByPlatform",
        (data) => {
          if (isMounted) setClientsByPlatform(data);
        }
      );
      dashboardSocketService.registerListener("ReceiveTopClients", (data) => {
        if (isMounted) setTopClients(data);
      });
      dashboardSocketService.registerListener(
        "ReceiveSalesByPlatform",
        (data) => {
          if (isMounted) setSalesByPlatform(data);
        }
      );
      dashboardSocketService.registerListener("DashboardLoadError", (msg) => {
        if (isMounted) setError(msg);
      });

      try {
        const metaResponse = await metaService.getMetas();
        if (isMounted) setMetaData(metaResponse);
      } catch (err) {
        console.error("Erro ao buscar metas:", err);
      }

      try {
        await dashboardSocketService.startConnection();
        await dashboardService.startDataGeneration();
      } catch (err) {
        if (isMounted) setError("Falha ao iniciar a busca de dados.");
      }
    };

    setupAndFetch();

    return () => {
      isMounted = false;
      dashboardSocketService.clearListeners();
    };
  }, [user]);

  const chartData = useMemo(() => {
    if (!historicalData) return [];
    return historicalData.map((item) => ({
      month: item.month.split("/")[0].substring(0, 3),
      commission: item.value,
    }));
  }, [historicalData]);

  const commissionLevels = useMemo(() => {
    if (!metaData || !commissionData) return null;
    const { metas } = metaData;
    const currentCommission = commissionData.monthlySoldCommission;
    const maxGoal =
      metas.length > 0
        ? [...metas].sort((a, b) => b.value - a.value)[0].value
        : 0;

    let currentLevel = null,
      nextLevel = metas.length > 0 ? metas[0] : null;
    const sortedMetas = [...metas].sort((a, b) => a.value - b.value);

    for (let i = sortedMetas.length - 1; i >= 0; i--) {
      if (currentCommission >= sortedMetas[i].value) {
        currentLevel = sortedMetas[i];
        nextLevel = sortedMetas[i + 1] || null;
        break;
      }
      nextLevel = sortedMetas[i];
    }

    const progressStart = currentLevel ? currentLevel.value : 0;
    const progressEnd = nextLevel ? nextLevel.value : maxGoal;
    const progress =
      progressEnd > progressStart
        ? Math.min(
            ((currentCommission - progressStart) /
              (progressEnd - progressStart)) *
              100,
            100
          )
        : currentCommission >= maxGoal
        ? 100
        : 0;
    const amountForNextLevel = nextLevel
      ? nextLevel.value - currentCommission
      : 0;

    return {
      levels: sortedMetas,
      currentLevel,
      nextLevel,
      progress,
      maxGoal,
      amountForNextLevel,
    };
  }, [metaData, commissionData]);

  const filteredClients = useMemo(() => {
    if (!topClients) return null;
    if (clientFilter === "Golden")
      return topClients.filter((c) => c.platform === 1);
    if (clientFilter === "Diamond")
      return topClients.filter((c) => c.platform === 2);
    return topClients;
  }, [topClients, clientFilter]);

  const pageVariants = {
    initial: { opacity: 0 },
    in: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };
  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  if (error) return <div className="loading-placeholder">Erro: {error}</div>;

  return (
    <motion.div
      className="home-page"
      variants={pageVariants}
      initial="initial"
      animate="in"
    >
      <motion.div className="stats-grid" variants={itemVariants}>
        <div className="stat-card card-base">
          <h3>
            <i className="fa-solid fa-users"></i> Total de Clientes
          </h3>
          {clientCount !== null ? (
            <p className="stat-value">
              <CountUp end={clientCount} duration={1.5} />
            </p>
          ) : (
            <SkeletonLoader className="skeleton-h1" />
          )}
        </div>
        <div className="stat-card card-base">
          <h3>
            <i className="fa-solid fa-hand-holding-dollar"></i> Comissão (Mês)
          </h3>
          {commissionData ? (
            <p className="stat-value">
              <CountUp
                end={commissionData.monthlySoldCommission}
                duration={2}
                prefix="R$ "
                separator="."
                decimal=","
                decimals={2}
              />
            </p>
          ) : (
            <SkeletonLoader className="skeleton-h1" />
          )}
        </div>
        <div className="stat-card card-base">
          <h3>
            <i className="fa-solid fa-hourglass-half"></i> Comissão Pendente
          </h3>
          {commissionData ? (
            <p className="stat-value">
              <CountUp
                end={commissionData.monthlyPendingCommission}
                duration={2.5}
                prefix="R$ "
                separator="."
                decimal=","
                decimals={2}
              />
            </p>
          ) : (
            <SkeletonLoader className="skeleton-h1" />
          )}
        </div>
      </motion.div>

      <motion.div className="main-grid" variants={itemVariants}>
        <div className="chart-container card-base">
          <div className="card-header">
            <h3>Comissões Recebidas (Últimos 6 meses)</h3>
          </div>
          {historicalData ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <XAxis dataKey="month" stroke="#9CA3AF" />
                <YAxis
                  stroke="#9CA3AF"
                  tickFormatter={(v) => `R$${v / 1000}k`}
                />
                <Tooltip
                  cursor={{ fill: "rgba(246, 209, 104, 0.1)" }}
                  contentStyle={{
                    backgroundColor: "#1F2A40",
                    border: "1px solid #374151",
                  }}
                />
                <Bar
                  dataKey="commission"
                  name="Comissão"
                  fill="#f6d168"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <SkeletonLoader className="skeleton-chart" />
          )}
        </div>
        <div className="top-clients-container card-base">
          <div className="card-header">
            <h3>Melhores Clientes</h3>
            <div className="client-filter-controls">
              <button
                className={clientFilter === "Todos" ? "active-filter" : ""}
                onClick={() => setClientFilter("Todos")}
              >
                Todos
              </button>
              <button
                className={clientFilter === "Golden" ? "active-filter" : ""}
                onClick={() => setClientFilter("Golden")}
              >
                Golden
              </button>
              <button
                className={clientFilter === "Diamond" ? "active-filter" : ""}
                onClick={() => setClientFilter("Diamond")}
              >
                Diamond
              </button>
            </div>
          </div>
          <ul className="client-list">
            {filteredClients ? (
              filteredClients.length > 0 ? (
                filteredClients.slice(0, 5).map((client, i) => (
                  <li key={i} className="client-item">
                    <div className="client-info">
                      <div className="client-platform-logo">
                        <PlatformLogo platformId={client.platform} />
                      </div>
                      <span>{client.name}</span>
                    </div>
                    <span className="client-balance">
                      {formatCurrency(client.totalInvested)}
                    </span>
                  </li>
                ))
              ) : (
                <p className="placeholder-text">
                  Nenhum cliente para esta plataforma.
                </p>
              )
            ) : (
              [...Array(5)].map((_, i) => (
                <SkeletonLoader key={i} className="skeleton-li" />
              ))
            )}
          </ul>
        </div>
      </motion.div>

      <motion.div className="secondary-grid" variants={itemVariants}>
        <div className="platform-stats-container card-base">
          <div className="card-header">
            <h3>
              <i className="fa-solid fa-chart-pie"></i> Análise de Plataformas
            </h3>
          </div>
          <div className="stats-content">
            <div className="stat-group">
              <h4>Distribuição de Clientes</h4>
              {clientsByPlatform && clientCount !== null ? (
                <>
                  <div className="stat-item">
                    <div className="stat-label">
                      <PlatformLogo platformId={1} />
                      <span>Golden Brasil</span>
                    </div>
                    <span className="stat-percentage">
                      {(
                        (clientsByPlatform.contratosDeMinerios /
                          (clientCount || 1)) *
                        100
                      ).toFixed(0)}
                      %
                    </span>
                  </div>
                  <AnimatedProgressBar
                    value={
                      (clientsByPlatform.contratosDeMinerios /
                        (clientCount || 1)) *
                      100
                    }
                    color="#f6d168"
                  />
                  <div className="stat-item" style={{ marginTop: "1rem" }}>
                    <div className="stat-label">
                      <PlatformLogo platformId={2} />
                      <span>Diamond Prime</span>
                    </div>
                    <span className="stat-percentage">
                      {(
                        (clientsByPlatform.diamondPrime / (clientCount || 1)) *
                        100
                      ).toFixed(0)}
                      %
                    </span>
                  </div>
                  <AnimatedProgressBar
                    value={
                      (clientsByPlatform.diamondPrime / (clientCount || 1)) *
                      100
                    }
                    color="#6B7280"
                  />
                </>
              ) : (
                <>
                  <SkeletonLoader
                    className="skeleton-p"
                    style={{ marginBottom: "0.5rem" }}
                  />
                  <SkeletonLoader
                    className="skeleton-li"
                    style={{ height: "8px", marginBottom: "1rem" }}
                  />
                  <SkeletonLoader
                    className="skeleton-p"
                    style={{ marginBottom: "0.5rem" }}
                  />
                  <SkeletonLoader
                    className="skeleton-li"
                    style={{ height: "8px" }}
                  />
                </>
              )}
            </div>

            <div className="stat-group">
              <h4>Total de Vendas (Mês)</h4>
              {salesByPlatform ? (
                <>
                  <div className="stat-item">
                    <div className="stat-label">
                      <PlatformLogo platformId={1} />
                      <span>Golden Brasil</span>
                    </div>
                    <span className="stat-value-small">
                      {formatCurrency(
                        salesByPlatform.contratosDeMinerios,
                        true
                      )}
                    </span>
                  </div>
                  <div className="stat-item" style={{ marginTop: "0.5rem" }}>
                    <div className="stat-label">
                      <PlatformLogo platformId={2} />
                      <span>Diamond Prime</span>
                    </div>
                    <span className="stat-value-small">
                      {formatCurrency(salesByPlatform.diamondPrime, true)}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <SkeletonLoader
                    className="skeleton-p"
                    style={{ width: "80%", marginBottom: "0.75rem" }}
                  />
                  <SkeletonLoader
                    className="skeleton-p"
                    style={{ width: "70%" }}
                  />
                </>
              )}
            </div>
          </div>
        </div>

        {commissionLevels ? (
          <motion.div
            layout
            className="levels-container card-base"
            variants={itemVariants}
          >
            <motion.div layout className="card-header">
              <h3>
                <i className="fa-solid fa-layer-group"></i> Níveis de Comissão
              </h3>
              <button
                className="levels-expand-button"
                onClick={() => setIsLevelsExpanded(!isLevelsExpanded)}
              >
                {isLevelsExpanded ? "Recolher" : "Exibir Níveis"}{" "}
                <i
                  className={`fa-solid ${
                    isLevelsExpanded ? "fa-chevron-up" : "fa-chevron-down"
                  }`}
                ></i>
              </button>
            </motion.div>
            <motion.div layout className="progress-summary">
              <span>
                Vendas no mês:{" "}
                <strong>
                  {formatCurrency(commissionData?.monthlySoldCommission, true)}
                </strong>
              </span>
              {commissionLevels.nextLevel ? (
                <span>
                  Próximo nível:{" "}
                  <strong>
                    {formatCurrency(commissionLevels.nextLevel.value)}
                  </strong>
                </span>
              ) : (
                <span>Você atingiu o nível máximo!</span>
              )}
            </motion.div>
            <div className="progress-bar-container">
              <motion.div
                className="progress-bar-fill"
                style={{ transformOrigin: "left" }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: commissionLevels.progress / 100 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
              {commissionLevels.levels.map((level) => {
                const percentage =
                  (level.value / commissionLevels.maxGoal) * 100;
                const isCompleted =
                  commissionData?.monthlySoldCommission >= level.value;
                return (
                  <div
                    key={level.value}
                    className={`level-marker ${isCompleted ? "completed" : ""}`}
                    style={{
                      left: `calc(10px + (100% - 20px) * ${percentage / 100})`,
                    }}
                  >
                    <div className="marker-dot"></div>
                    <div className="marker-tooltip">
                      <span className="tooltip-value">
                        {formatCurrency(level.value)}
                      </span>
                      <span className="tooltip-commission">
                        {level.commissionPercentage}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            {commissionLevels.nextLevel &&
              commissionLevels.amountForNextLevel > 0 && (
                <p className="next-level-info">
                  Faltam{" "}
                  <strong>
                    {formatCurrency(commissionLevels.amountForNextLevel, true)}
                  </strong>{" "}
                  para o próximo nível.
                </p>
              )}
            <AnimatePresence>
              {isLevelsExpanded && (
                <motion.div
                  className="expanded-levels-list"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                >
                  <ul>
                    {commissionLevels.levels.map((level, index, allLevels) => (
                      <li
                        key={level.value}
                        className={
                          commissionLevels.currentLevel?.value === level.value
                            ? "current"
                            : ""
                        }
                      >
                        <span>
                          De {formatCurrency(level.value)} a{" "}
                          {formatCurrency(allLevels[index + 1]?.value || "∞")}
                        </span>
                        <strong>
                          {level.commissionPercentage}% de comissão
                        </strong>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="card-base">
            <SkeletonLoader style={{ height: "100%" }} />
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default Home;
