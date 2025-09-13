import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './Context/AuthContext';
import { LoadProvider } from './Context/LoadContext';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <LoadProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </LoadProvider>
    </BrowserRouter>
  </React.StrictMode>
);