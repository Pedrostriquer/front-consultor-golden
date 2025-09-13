// src/components/RouteWrapper/RouteWrapper.js

import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom'; // 1. Importe o useLocation
import LoadingScreen from '../LoadingScreen/LoadingScreen';

const RouteWrapper = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const location = useLocation(); // 2. Obtenha o objeto de localização

  useEffect(() => {
    // Força o estado de loading para 'true' no início de cada transição
    setLoading(true); 

    const timer = setTimeout(() => {
      setLoading(false);
    }, 1200); // Duração do loading

    return () => clearTimeout(timer);
  }, [location.pathname]); // 3. A MÁGICA: O efeito agora depende do CAMINHO DA URL

  if (loading) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
};

export default RouteWrapper;