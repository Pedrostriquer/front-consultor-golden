import React, { useState } from "react";
import { useAuth } from "../../Context/AuthContext";
import "./Perfil.css";

const Perfil = () => {
  const { user } = useAuth();
  const [isCopied, setIsCopied] = useState(false);

  // Lógica para pegar as iniciais do nome (sem alterações)
  const getInitials = (name = "") => {
    const nameParts = name.trim().split(" ");
    if (nameParts.length === 1 && nameParts[0] !== "") {
      return nameParts[0].substring(0, 2).toUpperCase();
    }
    const firstInitial = nameParts[0]?.[0] || "";
    const lastInitial = nameParts[nameParts.length - 1]?.[0] || "";
    return `${firstInitial}${lastInitial}`.toUpperCase();
  };

  // Se o usuário ainda não foi carregado, exibe um skeleton loader
  if (!user) {
    return (
      <div className="perfil-page">
        <div className="page-header">
          <h1>Meu Perfil</h1>
          <p>Visualize e gerencie suas informações pessoais.</p>
        </div>
        <div className="card-base perfil-card skeleton-card">
          <div className="perfil-banner-skeleton"></div>
          <div className="perfil-avatar-skeleton"></div>
          <div className="perfil-content-skeleton">
            <div className="skeleton-text title"></div>
            <div className="skeleton-text subtitle"></div>
            <div className="skeleton-grid">
              <div className="skeleton-text long"></div>
              <div className="skeleton-text long"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Lógica do link de indicação (sem alterações)
  const indicationLink = `${window.location.origin}/cadastro?ref=${user.id}`;
  const handleCopyLink = () => {
    navigator.clipboard.writeText(indicationLink).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  return (
    <div className="perfil-page">
      <div className="page-header">
        <h1>Meu Perfil</h1>
        <p>Visualize e gerencie suas informações pessoais.</p>
      </div>

      {/* Card principal com a nova estrutura */}
      <div className="card-base perfil-card">
        {/* Banner decorativo */}
        <div className="perfil-banner"></div>
        
        {/* Avatar sobreposto */}
        <div className="perfil-avatar">{getInitials(user.name)}</div>

        {/* Conteúdo do card */}
        <div className="perfil-content">
          <div className="perfil-header-info">
            <h2 className="perfil-name">{user.name}</h2>
            <span className="perfil-role">Consultor(a)</span>
          </div>

          <div className="perfil-details-grid">
            <div className="detail-item">
              <label><i className="fa-solid fa-envelope"></i> Email</label>
              <span>{user.email}</span>
            </div>
            <div className="detail-item">
              <label><i className="fa-solid fa-id-card"></i> CPF</label>
              <span>{user.cpfCnpj}</span>
            </div>
            <div className="detail-item">
              <label><i className="fa-solid fa-percent"></i> Comissão</label>
              <span>{user.commissionPercentage}%</span>
            </div>
          </div>

          <div className="detail-item detail-item-full">
            <label><i className="fa-solid fa-link"></i> Seu Link de Indicação</label>
            <div className="indication-link-wrapper">
              <input type="text" value={indicationLink} readOnly />
              <button onClick={handleCopyLink} className={isCopied ? 'copied' : ''}>
                {isCopied ? (
                  <>
                    <i className="fa-solid fa-check"></i> Copiado!
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-copy"></i> Copiar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Perfil;