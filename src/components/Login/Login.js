import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './Login.css';

// Importando as logos
import goldenLogoImg from '../../img/logo-golden-ouro2.png';
import diamondLogoImg from '../../img/diamond_prime_diamond (1).png';

function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoading(true);
    // Simula uma chamada de API e redireciona após um tempo
    setTimeout(() => {
      navigate('/platform/dashboard');
    }, 1500);
  };

  // Variantes de animação para o Framer Motion
  const leftPanelVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: 'easeOut', staggerChildren: 0.2 } },
  };

  const formVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const logoItemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };


  return (
    <div className="login-page-merged">
      {/* PAINEL DA ESQUERDA - BRANDING COM ANIMAÇÕES */}
      <motion.div 
        className="login-branding"
        variants={leftPanelVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="branding-content">
            <motion.div className="logo-showcase-merged" variants={logoItemVariants}>
                <img src={goldenLogoImg} alt="Golden Brasil" className="showcase-logo" />
                <div className="logo-separator-login"></div>
                <img src={diamondLogoImg} alt="Diamond Prime" className="showcase-logo diamond" />
            </motion.div>
            <motion.h1 variants={logoItemVariants} className="branding-h1">Plataforma do Consultor</motion.h1>
            <motion.p variants={logoItemVariants} className="branding-p">Gerencie clientes, acompanhe contratos e impulsione seus resultados.</motion.p>
        </div>
      </motion.div>
      
      {/* PAINEL DA DIREITA - FORMULÁRIO */}
      <div className="login-form-area">
        <motion.div 
          className="login-form-wrapper card-base"
          variants={formVariants}
          initial="hidden"
          animate="visible"
        >
          <h2>Bem-vindo de volta!</h2>
          <p className='form-subtitle'>Acesse sua conta para continuar.</p>
          <form onSubmit={handleLogin}>
            <div className="input-group">
              <label htmlFor="email">Email</label>
              <div className="input-field">
                <i className="fa-solid fa-envelope"></i>
                <input 
                  type="email" 
                  id="email" 
                  placeholder="seuemail@exemplo.com"
                  defaultValue="consultor@golden.com"
                  required 
                />
              </div>
            </div>
            <div className="input-group">
              <label htmlFor="password">Senha</label>
              <div className="input-field">
                <i className="fa-solid fa-lock"></i>
                <input 
                  type="password" 
                  id="password" 
                  placeholder="••••••••" 
                  defaultValue="123456"
                  required 
                />
              </div>
            </div>
            <motion.button 
              type="submit" 
              className="login-button"
              disabled={isLoading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isLoading ? (
                <span className="spinner-button"></span>
              ) : (
                'Entrar'
              )}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

export default Login;