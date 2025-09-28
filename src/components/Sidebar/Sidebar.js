import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import './Sidebar.css';

import goldenLogoImg from '../../img/logo-golden-ouro2.png';
import diamondLogoImg from '../../img/diamond_prime_diamond (1).png';


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
    { name: 'Vendas', icon: 'fa-solid fa-file-invoice-dollar', path: '/platform/vendas' },
    { name: 'Saque', icon: 'fa-solid fa-wallet', path: '/platform/saque' },
    { name: 'Extrato', icon: 'fa-solid fa-receipt', path: '/platform/extrato' },
  ];

  const sidebarVariants = {
    expanded: { width: '280px', transition: { duration: 0.4, ease: "easeOut" } }, // <-- CORRIGIDO
    collapsed: { width: '90px', transition: { duration: 0.4, ease: "easeOut" } }  // <-- CORRIGIDO
  };

  const textVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.2, delay: 0.2 } },
  };
  
  const logoGroupVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3, delay: 0.1, ease: "easeOut" } },
  };

  return (
    <motion.nav
      className="sidebar"
      initial={false}
      animate={isCollapsed ? 'collapsed' : 'expanded'}
      variants={sidebarVariants}
    >
      <div className="logo-section">
        <AnimatePresence exitBeforeEnter>
          {isCollapsed ? (
            <motion.div key="collapsed-logo" className="collapsed-logo-wrapper" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }} transition={{ duration: 0.3 }}>
              <i className="fa-solid fa-gem"></i>
            </motion.div>
          ) : (
            <motion.div key="expanded-logo" className="expanded-logo-wrapper" initial="hidden" animate="visible" exit="hidden" variants={logoGroupVariants}>
              <div className="logo-images">
                <img src={goldenLogoImg} alt="Golden Brasil" className="logo-img" />
                <img src={diamondLogoImg} alt="Diamond Prime" className="logo-img diamond" />
              </div>
              <motion.div className="logo-text" variants={textVariants}>
                  <h1>Golden & Diamond</h1>
                  <p>Plataforma do Consultor</p>
              </motion.div>
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
            <Link to={item.path} className={`menu-item ${location.pathname.startsWith(item.path) ? 'active' : ''}`}>
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