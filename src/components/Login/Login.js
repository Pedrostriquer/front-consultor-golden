import React, { useState } from 'react';
import { useAuth } from "../../Context/AuthContext";
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from '../../components/Logo/Logo'; // Importando a sua logo
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

  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <div className="login-container">
      {/* PAINEL DA ESQUERDA - BRANDING */}
      <div className="login-branding">
        <div className="branding-content">
          <div className="logo-container">
            <Logo className="logo-svg" />
            <Logo className="logo-svg animated-border" aria-hidden="true" />
          </div>
          <h1 className="branding-h1">Plataforma do Consultor</h1>
          <p className="branding-p">Gerencie clientes, acompanhe contratos e impulsione seus resultados.</p>
        </div>
      </div>
      
      {/* PAINEL DA DIREITA - FORMULÁRIO */}
      <div className="login-form-area">
        <motion.form 
          className="login-form card-base" 
          onSubmit={handleLogin}
          variants={formVariants}
          initial="hidden"
          animate="visible"
        >
          <AnimatePresence>
            {isLoggingIn && (
              <motion.div 
                className="loading-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="spinner"></div>
                <p className="loading-text">Autenticando...</p>
              </motion.div>
            )}
          </AnimatePresence>

          <h2 className="login-form-h2">Acesse sua conta</h2>
          <p className="form-subtitle">Bem-vindo(a) de volta!</p>

          <AnimatePresence>
            {error && <motion.p initial={{opacity:0, y:-10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}} className="error-message">{error}</motion.p>}
          </AnimatePresence>
          
          <div className="input-group">
            <i className="fa-solid fa-envelope input-icon"></i>
            <input 
              type="email" 
              placeholder="seu.email@exemplo.com" 
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
          
          <motion.button 
            type="submit" 
            className="login-button" 
            disabled={isLoggingIn}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isLoggingIn ? 'Entrando...' : 'Entrar na Plataforma'}
          </motion.button>
        </motion.form>
      </div>
    </div>
  );
}

export default Login;