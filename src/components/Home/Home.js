import React, { useEffect } from 'react';
import './Home.css';
import { dashboardSocketService } from '../../dbServices/dashboardSocketService';
import dashboardService from '../../dbServices/dashboardService';
import { useAuth } from '../../Context/AuthContext';

const Home = () => {
  const { user } = useAuth();

  useEffect(() => {
    // Só executa se o usuário estiver logado
    if (user) {
      // --- REGISTRA OS OUVINTES DO SIGNALR ---

      // Adiciona o ouvinte para a mensagem de teste de conexão
      dashboardSocketService.registerListener("ConnectionTest", (message) => {
        console.log("%c[TESTE HUB]:", "color: #00ff00; font-weight: bold;", message);
      });

      // Ouvintes para os dados reais do dashboard
      dashboardSocketService.registerListener("ReceiveCommissionData", (data) => {
        console.log("Dados de Comissão Recebidos:", data);
      });

      dashboardSocketService.registerListener("ReceiveHistoricalCommissions", (data) => {
        console.log("Histórico de Comissões Recebido:", data);
      });

      dashboardSocketService.registerListener("ReceiveTotalClients", (data) => {
        console.log("Total de Clientes Recebido:", data);
      });

      dashboardSocketService.registerListener("ReceiveClientsByPlatform", (data) => {
        console.log("Clientes por Plataforma Recebidos:", data);
      });

      dashboardSocketService.registerListener("ReceiveTopClients", (data) => {
        console.log("Top Clientes Recebidos:", data);
      });
      
      dashboardSocketService.registerListener("DashboardLoadComplete", () => {
        console.log("Backend finalizou o carregamento de todos os dados do Dashboard.");
      });

      dashboardSocketService.registerListener("DashboardLoadError", (errorMessage) => {
        console.error("Erro no carregamento do Dashboard no backend:", errorMessage);
      });

      // --- INICIA A CONEXÃO E O PROCESSO DE DADOS ---
      const connectAndFetch = async () => {
        try {
          // 1. Inicia a conexão com o WebSocket (SignalR)
          await dashboardSocketService.startConnection();
          
          // 2. Após conectar, envia a requisição HTTP para o backend começar a processar os dados
          await dashboardService.startDataGeneration();

        } catch (error) {
          console.error("Ocorreu um erro durante o processo de conexão e busca de dados:", error);
        }
      };

      connectAndFetch();
    }

    // --- FUNÇÃO DE LIMPEZA ---
    // Esta função será executada quando o componente for "desmontado" (ex: ao sair da página)
    return () => {
      // Garante que a conexão WebSocket seja fechada para não consumir recursos
      dashboardSocketService.stopConnection();
    };
  }, [user]); // O useEffect será re-executado se o usuário mudar (ex: login/logout)


  return (
    <div className="home-page">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Visão geral e desempenho em tempo real.</p>
        <p style={{ color: '#f6d168', marginTop: '1rem' }}>
          Abra o console do navegador (F12) para ver os dados chegando em tempo real.
        </p>
      </div>
      
      {/* A UI do dashboard será construída aqui */}
    </div>
  );
};

export default Home;