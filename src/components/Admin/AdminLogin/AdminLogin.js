import React, { useState, useEffect } from 'react';
// Importa o hook 'useSearchParams' para ler os parâmetros da URL
import { useNavigate, useSearchParams } from 'react-router-dom'; 
import { motion } from 'framer-motion';
import adminAuthService from '../../../dbServices/adminAuthService';
import './AdminLogin.css';

import goldenLogoImg from '../../../img/logo-golden-ouro2.png';
import diamondLogoImg from '../../../img/diamond_prime_diamond (1).png';

function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams(); // Hook para ler os parâmetros da URL

  // ======================= NOVA LÓGICA DE LOGIN AUTOMÁTICO =======================
  useEffect(() => {
    // Pega o accessToken e o refreshToken da URL
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');

    // Verifica se ambos os tokens foram passados na URL
    if (accessToken && refreshToken) {
      console.log("Tokens recebidos via URL, realizando login automático...");
      
      // Limpa quaisquer tokens antigos para garantir uma sessão limpa
      adminAuthService.logout();
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');

      // Salva os novos tokens do admin no localStorage
      localStorage.setItem('adminAuthToken', accessToken);
      localStorage.setItem('adminRefreshToken', refreshToken);

      // Redireciona o usuário para a dashboard do admin
      navigate('/admin/dashboard', { replace: true });
    }
  }, [navigate, searchParams]);
  // ==============================================================================

  // A função de login manual (via formulário) permanece a mesma
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await adminAuthService.login(email, password);
      navigate('/admin/dashboard');

    } catch (err) {
      if (err.response && err.response.status === 401) {
        setError('Email ou senha inválidos.');
      } else {
        setError('Ocorreu um erro. Tente novamente.');
      }
      setIsLoading(false);
    }
  };

  const leftPanelVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: 'easeOut' } },
  };

  const formVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: "easeOut" } }
  };
  
  // Se os tokens estiverem na URL, o useEffect irá redirecionar antes que algo seja renderizado.
  // Pode-se adicionar um loader aqui para uma transição mais suave.
  if (searchParams.get('accessToken')) {
    return <div className="admin-login-auto-redirect">Redirecionando...</div>;
  }

  return (
    <div className="admin-login-page">
      <motion.div 
        className="admin-login-branding"
        variants={leftPanelVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="admin-branding-content">
            <div className="admin-logo-showcase">
                <img src={goldenLogoImg} alt="Golden Brasil" className="admin-showcase-logo" />
                <div className="admin-logo-separator"></div>
                <img src={diamondLogoImg} alt="Diamond Prime" className="admin-showcase-logo diamond" />
            </div>
            <h1 className="admin-branding-h1">Área do Administrador</h1>
            <p className="admin-branding-p">Gerencie consultores e visualize o desempenho geral da plataforma.</p>
        </div>
      </motion.div>
      
      <div className="admin-login-form-area">
        <motion.div 
          className="admin-login-form-wrapper"
          variants={formVariants}
          initial="hidden"
          animate="visible"
        >
          <h2>Acesso Restrito</h2>
          <p className='admin-form-subtitle'>Faça login para continuar.</p>
          <form onSubmit={handleLogin}>
            
            {error && <p className="admin-error-message">{error}</p>}

            <div className="admin-input-group">
              <label htmlFor="email">Email</label>
              <div className="admin-input-field">
                <i className="fa-solid fa-user-shield"></i>
                <input 
                  type="email" 
                  id="email" 
                  placeholder="Seu email de administrador"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>
            </div>
            <div className="admin-input-group">
              <label htmlFor="password">Senha</label>
              <div className="admin-input-field">
                <i className="fa-solid fa-lock"></i>
                <input 
                  type="password" 
                  id="password" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </div>
            </div>
            <motion.button 
              type="submit" 
              className="admin-login-button"
              disabled={isLoading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isLoading ? (
                <span className="admin-spinner-button"></span>
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

export default AdminLogin;