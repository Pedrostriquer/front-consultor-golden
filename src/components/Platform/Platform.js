import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "../Sidebar/Sidebar";
import Home from "../Home/Home";
import Clientes from "../Clientes/Clientes";
import Saque from "../Saque/Saque";
import Extrato from "../Extrato/Extrato";
import Perfil from "../Perfil/Perfil";
import ClientDetailPage from "../Clientes/ClientDetailPage/ClientDetailPage";
import ContractDetailPage from "../Clientes/ClientDetailPage/ContractDetailPage/ContractDetailPage";

import "./Platform.css";

function Platform() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="platform-container">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />
      <main className={`content ${isSidebarCollapsed ? "collapsed" : ""}`}>
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
    </div>
  );
}

export default Platform;
