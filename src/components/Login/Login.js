import React, { useState } from 'react';
import { useAuth } from "../../Context/AuthContext";
import './Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoggingIn(true);
    try {
      await login(email, password, rememberMe);
    } catch (err) {
      setError('Email ou senha inválidos. Tente novamente.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-branding">
        <div className="branding-content">
          <i className="fa-solid fa-chart-line branding-icon"></i>
          <h1 className="branding-h1">Plataforma do Consultor</h1>
          <p className="branding-p">Acesse seu painel para gerenciar clientes e acompanhar seu desempenho.</p>
        </div>
      </div>
      <div className="login-form-area">
        <form className="login-form" onSubmit={handleLogin}>
          {isLoggingIn && (
            <div className="loading-overlay">
              <div className="spinner"></div>
              <p className="loading-text">Verificando credenciais...</p>
            </div>
          )}
          <h2 className="login-form-h2">Bem-vindo(a) de volta!</h2>
          <p className="form-subtitle">Faça login para continuar.</p>

          {error && <p className="error-message">{error}</p>}
          
          <div className="input-group">
            <i className="fa-solid fa-envelope input-icon"></i>
            <input 
              type="email" 
              placeholder="Email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
              className="input-field"
            />
          </div>
          
          <div className="input-group">
            <i className="fa-solid fa-lock input-icon"></i>
            <input 
              type={showPassword ? 'text' : 'password'} 
              placeholder="Senha" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
              className="input-field"
            />
            <i 
              className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'} password-toggle-icon`}
              onClick={() => setShowPassword(!showPassword)}
            ></i>
          </div>

          <div className="options-container">
            <label className="remember-me">
                <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                />
                Lembrar de mim
            </label>
            <a href="/forgot-password" className="forgot-password-link">Esqueceu a senha?</a>
          </div>
          
          <button type="submit" className="login-button" disabled={isLoggingIn}>
            {isLoggingIn ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;