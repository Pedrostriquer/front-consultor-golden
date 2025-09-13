import React from 'react';
import './LoadingScreen.css';

const LoadingScreen = () => {
  return (
    <div className="loading-screen">
      <div className="loading-content">
        <i className="fa-solid fa-gem loading-icon"></i>
        <p className="loading-text">Carregando...</p>
      </div>
    </div>
  );
};

export default LoadingScreen;