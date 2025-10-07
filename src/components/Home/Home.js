import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
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
  <div className={`d_home-skeleton-loader ${className}`} style={style}></div>
);

const formatCurrency = (value = 0, showDecimals = false) =>
  `R$ ${value.toLocaleString("pt-BR", {
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  })}`;

const getFirstName = (fullName) => {
  if (!fullName) return "";
  return fullName.split(" ")[0];
};

const PlatformLogo = ({ platformId }) => (
  <img
    src={platformId === 1 ? goldenLogo : diamondLogo}
    alt={platformId === 1 ? "Golden Brasil" : "Diamond Prime"}
    className="d_home-platform-logo-small"
    title={platformId === 1 ? "Golden Brasil" : "Diamond Prime"}
  />
);

const AnimatedProgressBar = ({ value, color }) => (
  <div className="d_home-progress-bar-background">
    <motion.div
      className="d_home-progress-bar-foreground"
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
  const navigate = useNavigate();

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
      console.log("LOG: Iniciando setupAndFetch...");

      dashboardSocketService.registerListener(
        "ReceiveCommissionData",
        (data) => {
          console.log("LOG: ReceiveCommissionData ->", data);
          if (isMounted) setCommissionData(data);
        }
      );
      dashboardSocketService.registerListener(
        "ReceiveHistoricalCommissions",
        (data) => {
          console.log("LOG: ReceiveHistoricalCommissions ->", data);
          if (isMounted) setHistoricalData(data);
        }
      );
      dashboardSocketService.registerListener("ReceiveTotalClients", (data) => {
        console.log("LOG: ReceiveTotalClients ->", data);
        if (isMounted) setClientCount(data.totalClientCount);
      });
      dashboardSocketService.registerListener(
        "ReceiveClientsByPlatform",
        (data) => {
          console.log("LOG: ReceiveClientsByPlatform ->", data);
          if (isMounted) setClientsByPlatform(data);
        }
      );
      dashboardSocketService.registerListener("ReceiveTopClients", (data) => {
        console.log("LOG: ReceiveTopClients ->", data);
        if (isMounted) setTopClients(data);
      });
      dashboardSocketService.registerListener(
        "ReceiveSalesByPlatform",
        (data) => {
          console.log("LOG: ReceiveSalesByPlatform ->", data);
          if (isMounted) setSalesByPlatform(data);
        }
      );
      dashboardSocketService.registerListener("DashboardLoadError", (msg) => {
        console.error("LOG: DashboardLoadError ->", msg);
        if (isMounted) setError(msg);
      });

      try {
        console.log("LOG: Buscando dados de metas...");
        const metaResponse = await metaService.getMetas();
        console.log("LOG: Resposta de Metas ->", metaResponse);
        if (isMounted) setMetaData(metaResponse);
      } catch (err) {
        console.error("LOG: Erro ao buscar metas:", err);
      }

      try {
        console.log("LOG: Conectando SignalR e iniciando geração de dados...");
        await dashboardSocketService.startConnection();
        await dashboardService.startDataGeneration();
        console.log("LOG: Conexão bem-sucedida e requisição enviada.");
      } catch (err) {
        if (isMounted) setError("Falha ao iniciar a busca de dados.");
        console.error("LOG: Erro na conexão SignalR ou geração de dados:", err);
      }
    };

    setupAndFetch();

    return () => {
      isMounted = false;
      dashboardSocketService.clearListeners();
    };
  }, [user]);

  // ======================= INÍCIO DA CORREÇÃO =======================
  /**
   * Navega para a página de detalhes do cliente, passando o platformId no estado.
   * @param {object} client - O objeto do cliente contendo cpfCnpj e platform.
   */
  const handleClientClick = (client) => {
    if (client && client.cpfCnpj && client.platform) {
      navigate(`/platform/clientes/${client.cpfCnpj}`, {
        state: { platformId: client.platform },
      });
    }
  };
  // ======================= FIM DA CORREÇÃO =======================

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
    const currentSalesValue = commissionData.monthlySoldValue;
    const maxGoal =
      metas.length > 0
        ? [...metas].sort((a, b) => b.value - a.value)[0].value
        : 0;
    let currentLevel = null,
      nextLevel = metas.length > 0 ? metas[0] : null;
    const sortedMetas = [...metas].sort((a, b) => a.value - b.value);

    for (let i = sortedMetas.length - 1; i >= 0; i--) {
      if (currentSalesValue >= sortedMetas[i].value) {
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
            ((currentSalesValue - progressStart) /
              (progressEnd - progressStart)) *
              100,
            100
          )
        : currentSalesValue >= maxGoal
        ? 100
        : 0;
    const amountForNextLevel = nextLevel
      ? nextLevel.value - currentSalesValue
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

  if (error)
    return <div className="d_home-loading-placeholder">Erro: {error}</div>;

  return (
    <motion.div
      className="dashboard-home-page"
      variants={pageVariants}
      initial="initial"
      animate="in"
    >
      <motion.div className="d_home-stats-grid" variants={itemVariants}>
        <div className="d_home-stat-card d_home-card-base">
          <h3>
            <i className="fa-solid fa-users"></i> Total de Clientes
          </h3>
          {clientCount !== null ? (
            <p className="d_home-stat-value">
              <CountUp end={clientCount} duration={1.5} />
            </p>
          ) : (
            <SkeletonLoader className="d_home-skeleton-h1" />
          )}
        </div>
        <div className="d_home-stat-card d_home-card-base">
          <h3>
            <i className="fa-solid fa-hand-holding-dollar"></i> Comissão (Mês)
          </h3>
          {commissionData ? (
            <p className="d_home-stat-value">
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
            <SkeletonLoader className="d_home-skeleton-h1" />
          )}
        </div>
        <div className="d_home-stat-card d_home-card-base">
          <h3>
            <i className="fa-solid fa-hourglass-half"></i> Comissão Pendente
          </h3>
          {commissionData ? (
            <p className="d_home-stat-value">
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
            <SkeletonLoader className="d_home-skeleton-h1" />
          )}
        </div>
      </motion.div>

      <motion.div className="d_home-main-grid" variants={itemVariants}>
        <div className="d_home-chart-container d_home-card-base">
          <div className="d_home-card-header">
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
            <SkeletonLoader className="d_home-skeleton-chart" />
          )}
        </div>
        <div className="d_home-top-clients-container d_home-card-base">
          <div className="d_home-card-header">
            <h3>Melhores Clientes</h3>
            <div className="d_home-client-filter-controls">
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
          <ul className="d_home-client-list">
            {filteredClients ? (
              filteredClients.length > 0 ? (
                filteredClients.slice(0, 5).map((client, i) => (
                  // ======================= INÍCIO DA CORREÇÃO =======================
                  <li
                    key={i}
                    className="d_home-client-item clickable"
                    onClick={() => handleClientClick(client)}
                  >
                  {/* ======================= FIM DA CORREÇÃO ======================= */}
                    <div className="d_home-client-info">
                      <div className="d_home-client-platform-logo">
                        <PlatformLogo platformId={client.platform} />
                      </div>
                      <span>{getFirstName(client.name)}</span>
                    </div>
                    <span className="d_home-client-balance">
                      {formatCurrency(client.totalInvested)}
                    </span>
                  </li>
                ))
              ) : (
                <p className="d_home-placeholder-text">
                  Nenhum cliente para esta plataforma.
                </p>
              )
            ) : (
              [...Array(5)].map((_, i) => (
                <SkeletonLoader key={i} className="d_home-skeleton-li" />
              ))
            )}
          </ul>
        </div>
      </motion.div>

      <motion.div className="d_home-secondary-grid" variants={itemVariants}>
        <div className="d_home-platform-stats-container d_home-card-base">
          <div className="d_home-card-header">
            <h3>
              <i className="fa-solid fa-chart-pie"></i> Análise de Plataformas
            </h3>
          </div>
          <div className="d_home-stats-content">
            <div className="d_home-stat-group">
              <h4>Distribuição de Clientes</h4>
              {clientsByPlatform && clientCount !== null ? (
                <>
                  <div className="d_home-stat-item">
                    <div className="d_home-stat-label">
                      <PlatformLogo platformId={1} />
                      <span>Golden Brasil</span>
                    </div>
                    <span className="d_home-stat-percentage">
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
                  <div
                    className="d_home-stat-item"
                    style={{ marginTop: "1rem" }}
                  >
                    <div className="d_home-stat-label">
                      <PlatformLogo platformId={2} />
                      <span>Diamond Prime</span>
                    </div>
                    <span className="d_home-stat-percentage">
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
                    className="d_home-skeleton-p"
                    style={{ marginBottom: "0.5rem" }}
                  />
                  <SkeletonLoader
                    className="d_home-skeleton-li"
                    style={{ height: "8px", marginBottom: "1rem" }}
                  />
                  <SkeletonLoader
                    className="d_home-skeleton-p"
                    style={{ marginBottom: "0.5rem" }}
                  />
                  <SkeletonLoader
                    className="d_home-skeleton-li"
                    style={{ height: "8px" }}
                  />
                </>
              )}
            </div>
            <div className="d_home-stat-group">
              <h4>Total de Vendas (Mês)</h4>
              {salesByPlatform ? (
                <>
                  <div className="d_home-stat-item">
                    <div className="d_home-stat-label">
                      <PlatformLogo platformId={1} />
                      <span>Golden Brasil</span>
                    </div>
                    <span className="d_home-stat-value-small">
                      {formatCurrency(
                        salesByPlatform.contratosDeMinerios,
                        true
                      )}
                    </span>
                  </div>
                  <div
                    className="d_home-stat-item"
                    style={{ marginTop: "0.5rem" }}
                  >
                    <div className="d_home-stat-label">
                      <PlatformLogo platformId={2} />
                      <span>Diamond Prime</span>
                    </div>
                    <span className="d_home-stat-value-small">
                      {formatCurrency(salesByPlatform.diamondPrime, true)}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <SkeletonLoader
                    className="d_home-skeleton-p"
                    style={{ width: "80%", marginBottom: "0.75rem" }}
                  />
                  <SkeletonLoader
                    className="d_home-skeleton-p"
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
            className="d_home-levels-container d_home-card-base"
            variants={itemVariants}
          >
            <motion.div layout className="d_home-card-header">
              <h3>
                <i className="fa-solid fa-layer-group"></i> Níveis de Comissão
              </h3>
              <button
                className="d_home-levels-expand-button"
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
            <motion.div layout className="d_home-progress-summary">
              <span>
                Vendas no mês:{" "}
                <strong>
                  {formatCurrency(commissionData?.monthlySoldValue, true)}
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
            <div className="d_home-progress-bar-container">
              <motion.div
                className="d_home-progress-bar-fill"
                style={{ transformOrigin: "left" }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: commissionLevels.progress / 100 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
              {commissionLevels.levels.map((level) => {
                const percentage =
                  (level.value / commissionLevels.maxGoal) * 100;
                const isCompleted =
                  commissionData?.monthlySoldValue >= level.value;
                return (
                  <div
                    key={level.value}
                    className={`d_home-level-marker ${
                      isCompleted ? "completed" : ""
                    }`}
                    style={{
                      left: `calc(10px + (100% - 20px) * ${percentage / 100})`,
                    }}
                  >
                    <div className="d_home-marker-dot"></div>
                    <div className="d_home-marker-tooltip">
                      <span className="d_home-tooltip-value">
                        {formatCurrency(level.value)}
                      </span>
                      <span className="d_home-tooltip-commission">
                        {level.commission_percentage}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            {commissionLevels.nextLevel &&
              commissionLevels.amountForNextLevel > 0 && (
                <p className="d_home-next-level-info">
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
                  className="d_home-expanded-levels-list"
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
                          {level.commission_percentage}% de comissão
                        </strong>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="d_home-card-base">
            <SkeletonLoader style={{ height: "100%" }} />
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default Home;