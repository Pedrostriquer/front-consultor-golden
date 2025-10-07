import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import adminAuthService from '../../../dbServices/adminAuthService';
import './AdminSidebar.css'; 

// Use um logo genérico ou o da Golden
import logo from '../../../img/logo-golden-ouro2.png';

const AdminSidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    adminAuthService.logout();
    navigate('/admin/login');
  };

  return (
    <div className="admin-sidebar">
      <div className="admin-sidebar-logo">
        <img src={logo} alt="Logo" />
        <span>Admin</span>
      </div>
      <nav className="admin-sidebar-nav">
        <NavLink to="/admin/dashboard" className="admin-nav-link">
          <i className="fa-solid fa-chart-line"></i>
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/admin/consultores" className="admin-nav-link">
          <i className="fa-solid fa-users"></i>
          <span>Consultores</span>
        </NavLink>
        {/* Adicione outros links aqui no futuro, como "Metas" */}
      </nav>
      <div className="admin-sidebar-footer">
        <button onClick={handleLogout} className="admin-logout-button">
          <i className="fa-solid fa-right-from-bracket"></i>
          <span>Sair</span>
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;