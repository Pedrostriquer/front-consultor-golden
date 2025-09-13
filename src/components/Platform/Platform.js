import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Sidebar from "../Sidebar/Sidebar";
import Home from "../Home/Home";
import Clientes from "../Clientes/Clientes";
import Saque from "../Saque/Saque";
import Extrato from "../Extrato/Extrato";
import Perfil from "../Perfil/Perfil";
import ClientDetailPage from "../Clientes/ClientDetailPage/ClientDetailPage";
import ContractDetailPage from "../Clientes/ClientDetailPage/ContractDetailPage/ContractDetailPage";
import LoadingScreen from "../LoadingScreen/LoadingScreen";

import "./Platform.css";

function Platform() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    setIsPageLoading(true);
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  const contentVariants = {
    expanded: { 
      marginLeft: "calc(280px + 2rem)", 
      transition: { duration: 0.4, ease: [0.6, 0.05, -0.01, 0.9] } 
    },
    collapsed: { 
      marginLeft: "calc(90px + 2rem)", 
      transition: { duration: 0.4, ease: [0.6, 0.05, -0.01, 0.9] } 
    }
  };

  return (
    <div className="platform-container">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />
      
      {/* O LOADER FOI MOVIDO PARA FORA DO CONTENT-WRAPPER */}
      {/* Ele agora é um irmão do wrapper e da sidebar, garantindo sua posição fixa */}
      <AnimatePresence>
        {isPageLoading && (
          <LoadingScreen
            isContentLoader={true}
            isSidebarCollapsed={isSidebarCollapsed} 
          />
        )}
      </AnimatePresence>

      <motion.div 
        className="content-wrapper"
        initial={false}
        animate={isSidebarCollapsed ? "collapsed" : "expanded"}
        variants={contentVariants}
      >
        <main className={`content ${isPageLoading ? "content--loading" : ""}`}>
          <Routes>
            <Route path="dashboard" element={<Home />} />
            <Route path="clientes" element={<Clientes />} />
            <Route path="clientes/:clientId" element={<ClientDetailPage />} />
            <Route
              path="clientes/:clientId/contratos/:contractId"
              element={<ContractDetailPage />}
            />
            <Route path="saque" element={<Saque />} />
            <Route path="extrato" element={<Extrato />} />
            <Route path="perfil" element={<Perfil />} />
            <Route path="/" element={<Navigate to="dashboard" />} />
          </Routes>
        </main>
      </motion.div>
    </div>
  );
}

export default Platform;