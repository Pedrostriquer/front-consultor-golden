import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import './Sidebar.css';

const getInitials = (name) => {
  if (!name) return '';
  const names = name.split(' ');
  if (names.length > 1) {
    return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
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

  return (
    <nav className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <Link to="/platform/perfil" className="profile-link">
        <div className="profile-section">
          <div className="profile-avatar">{getInitials(user?.name)}</div>
          {!isCollapsed && (
              <div className="profile-info">
                  <span className="profile-name">{user?.name}</span>
                  <span className="profile-role">Consultor</span>
              </div>
          )}
        </div>
      </Link>

      <ul className="menu-list">
        {menuItems.map((item) => (
          <li key={item.name}>
            <Link to={item.path} className={`menu-item ${location.pathname === item.path ? 'active' : ''}`}>
              <i className={item.icon}></i>
              {!isCollapsed && <span>{item.name}</span>}
            </Link>
          </li>
        ))}
      </ul>
      
      <div className="sidebar-footer">
        <div className="menu-item" onClick={logout}>
            <i className="fa-solid fa-arrow-right-from-bracket"></i>
            {!isCollapsed && <span>Sair</span>}
        </div>
        <div className="menu-item collapse-button" onClick={() => setIsCollapsed(!isCollapsed)}>
            <i className={`fa-solid ${isCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'}`}></i>
            {!isCollapsed && <span>Recolher</span>}
        </div>
      </div>
    </nav>
  );
};

export default Sidebar;