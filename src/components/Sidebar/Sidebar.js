import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from '../../components/Logo/Logo'; // Importando o componente da logo
import './Sidebar.css';

const getInitials = (name) => {
  if (!name) return '';
  const names = name.split(' ');
  return names.length > 1 ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase() : name.substring(0, 2).toUpperCase();
};

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const menuItems = [
    { name: 'Home', icon: 'fa-solid fa-house', path: '/platform/dashboard' },
    { name: 'Clientes', icon: 'fa-solid fa-users', path: '/platform/clientes' },
    { name: 'Saque', icon: 'fa-solid fa-wallet', path: '/platform/saque' },
    { name: 'Extrato', icon: 'fa-solid fa-receipt', path: '/platform/extrato' },
  ];

  const sidebarVariants = {
    expanded: { width: '280px', transition: { duration: 0.4, ease: [0.6, 0.05, -0.01, 0.9] } },
    collapsed: { width: '90px', transition: { duration: 0.4, ease: [0.6, 0.05, -0.01, 0.9] } }
  };

  const textVariants = {
    hidden: { opacity: 0, x: -20, transition: { duration: 0.2 } },
    visible: { opacity: 1, x: 0, transition: { duration: 0.2, delay: 0.1 } },
  };

  return (
    <motion.nav
      className="sidebar"
      initial={false}
      animate={isCollapsed ? 'collapsed' : 'expanded'}
      variants={sidebarVariants}
    >
      <div className="logo-section">
        {/* Usando o wrapper para controlar o tamanho e a sobreposição das logos */}
        <div className="logo-wrapper">
          <Logo className="logo-svg" />
          <Logo className="logo-svg animated-border" aria-hidden="true" />
        </div>
        
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div className="logo-text" initial="hidden" animate="visible" exit="hidden" variants={textVariants}>
              <h1>Golden Brasil</h1>
              <p>Página do Consultor</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Link to="/platform/perfil" className="profile-link">
        <div className="profile-section">
          <div className="profile-avatar">{getInitials(user?.name)}</div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div className="profile-info" initial="hidden" animate="visible" exit="hidden" variants={textVariants}>
                <span className="profile-name">{user?.name}</span>
                <span className="profile-role">Consultor</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Link>

      <ul className="menu-list">
        {menuItems.map((item) => (
          <li key={item.name}>
            <Link to={item.path} className={`menu-item ${location.pathname === item.path ? 'active' : ''}`}>
              <i className={item.icon}></i>
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.span initial="hidden" animate="visible" exit="hidden" variants={textVariants}>
                    {item.name}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          </li>
        ))}
      </ul>
      
      <div className="sidebar-footer">
        <div className="menu-item" onClick={logout}>
          <i className="fa-solid fa-arrow-right-from-bracket"></i>
          <AnimatePresence>
            {!isCollapsed && <motion.span initial="hidden" animate="visible" exit="hidden" variants={textVariants}>Sair</motion.span>}
          </AnimatePresence>
        </div>
        <div className="menu-item collapse-button" onClick={() => setIsCollapsed(!isCollapsed)}>
          <i className={`fa-solid ${isCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'}`}></i>
          <AnimatePresence>
            {!isCollapsed && <motion.span initial="hidden" animate="visible" exit="hidden" variants={textVariants}>Recolher</motion.span>}
          </AnimatePresence>
        </div>
      </div>
    </motion.nav>
  );
};

export default Sidebar;