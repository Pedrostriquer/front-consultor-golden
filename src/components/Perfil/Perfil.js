import React, { useState } from "react";
import { useAuth } from "../../Context/AuthContext";
import "./Perfil.css";

const Perfil = () => {
  const { user } = useAuth();
  const [isCopied, setIsCopied] = useState(false);
  const [isBindingCopied, setIsBindingCopied] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { day: "2-digit", month: "2-digit", year: "numeric" };
    return new Date(dateString).toLocaleDateString("pt-BR", options);
  };

  const getInitials = (name = "") => {
    const nameParts = name.trim().split(" ");
    if (nameParts.length === 1 && nameParts[0] !== "") {
      return nameParts[0].substring(0, 2).toUpperCase();
    }
    const firstInitial = nameParts[0]?.[0] || "";
    const lastInitial = nameParts[nameParts.length - 1]?.[0] || "";
    return `${firstInitial}${lastInitial}`.toUpperCase();
  };

  const createUrlFriendlyName = (name = "") => {
    if (!name) return "";
    const firstName = name.trim().split(" ")[0];
    const normalized = firstName
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    return (
      normalized.charAt(0).toUpperCase() + normalized.slice(1).toLowerCase()
    );
  };

  if (!user) {
    return (
      <div className="perfil-page">
        <div className="page-header compact">
          <h1>Meu Perfil</h1>
        </div>
        <div className="card-base perfil-card skeleton-card">
          <div className="perfil-banner-skeleton"></div>
          <div className="perfil-content-skeleton">
            <div className="skeleton-text title"></div>
            <div className="skeleton-grid">
              <div className="skeleton-text long"></div>
              <div className="skeleton-text long"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const friendlyConsultantName = createUrlFriendlyName(user.name);
  const indicationLink = `https://areadocliente.goldenbrasil.com.br/cadastro?ref=${user.id}&consultor=${friendlyConsultantName}`;
  const bindingLink = `https://areadocliente.goldenbrasil.com.br/vincular?consultorId=${
    user.id
  }&consultorName=${encodeURIComponent(user.name)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(indicationLink).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const handleCopyBindingLink = () => {
    navigator.clipboard.writeText(bindingLink).then(() => {
      setIsBindingCopied(true);
      setTimeout(() => setIsBindingCopied(false), 2000);
    });
  };

  return (
    <div className="perfil-page">
      <div className="page-header compact">
        <h1>Meu Perfil</h1>
        <p>Gerencie suas informações.</p>
      </div>

      <div className="card-base perfil-card">
        <div className="perfil-banner"></div>

        <div className="perfil-body">
          {/* Coluna Esquerda: Avatar e Nome */}
          <div className="perfil-identity">
            <div className="perfil-avatar">{getInitials(user.name)}</div>
            <h2 className="perfil-name">{user.name}</h2>
            <span className="perfil-role">Consultor(a) Golden & Diamond</span>
          </div>

          <div className="perfil-divider"></div>

          {/* Coluna Direita: Dados e Links */}
          <div className="perfil-info-section">
            {/* Grid de Informações - 3 Colunas */}
            <div className="perfil-details-grid">
              <div className="detail-item">
                <label>
                  <i className="fa-solid fa-envelope"></i> Email
                </label>
                <span title={user.email}>{user.email}</span>
              </div>
              <div className="detail-item">
                <label>
                  <i className="fa-solid fa-phone"></i> Telefone
                </label>
                <span>{user.phoneNumber || "Não informado"}</span>
              </div>
              <div className="detail-item">
                <label>
                  <i className="fa-solid fa-id-card"></i> CPF
                </label>
                <span>{user.cpfCnpj}</span>
              </div>
              <div className="detail-item">
                <label>
                  <i className="fa-solid fa-cake-candles"></i> Nascimento
                </label>
                <span>{formatDate(user.birthDate)}</span>
              </div>
              <div className="detail-item">
                <label>
                  <i className="fa-solid fa-percent"></i> Comissão
                </label>
                <span>{user.commissionPercentage}%</span>
              </div>
              <div className="detail-item">
                <label>
                  <i className="fa-solid fa-calendar-check"></i> Desde
                </label>
                <span>{formatDate(user.dateCreated)}</span>
              </div>
            </div>

            {/* Area de Links - Lado a Lado */}
            <div className="links-container">
              <div className="link-box">
                <label>
                  <i className="fa-solid fa-user-plus"></i> Link p/ Novos
                  Clientes
                </label>
                <div className="indication-link-wrapper">
                  <input type="text" value={indicationLink} readOnly />
                  <button
                    onClick={handleCopyLink}
                    className={isCopied ? "copied" : ""}
                  >
                    {isCopied ? (
                      <i className="fa-solid fa-check"></i>
                    ) : (
                      <i className="fa-solid fa-copy"></i>
                    )}
                  </button>
                </div>
              </div>

              <div className="link-box">
                <label>
                  <i className="fa-solid fa-link"></i> Link p/ Vincular Clientes
                </label>
                <div className="indication-link-wrapper">
                  <input type="text" value={bindingLink} readOnly />
                  <button
                    onClick={handleCopyBindingLink}
                    className={isBindingCopied ? "copied" : ""}
                  >
                    {isBindingCopied ? (
                      <i className="fa-solid fa-check"></i>
                    ) : (
                      <i className="fa-solid fa-copy"></i>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Perfil;
