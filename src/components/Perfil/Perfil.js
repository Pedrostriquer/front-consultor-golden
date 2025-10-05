import React, { useState } from "react";
import { useAuth } from "../../Context/AuthContext";
import "./Perfil.css";

const Perfil = () => {
  const { user } = useAuth();
  const [isCopied, setIsCopied] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
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

  // --- NOVA FUNÇÃO PARA CRIAR UM NOME AMIGÁVEL PARA URL ---
  const createUrlFriendlyName = (name = "") => {
    if (!name) return "";
    // 1. Pega o primeiro nome
    const firstName = name.trim().split(" ")[0];
    // 2. Remove acentos e caracteres especiais
    const normalized = firstName
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    // 3. Capitaliza a primeira letra e deixa o resto minúsculo
    return normalized.charAt(0).toUpperCase() + normalized.slice(1).toLowerCase();
  };


  if (!user) {
    // Skeleton loader
    return (
      <div className="perfil-page">
        <div className="page-header"><h1>Meu Perfil</h1></div>
        <div className="card-base perfil-card skeleton-card">
          <div className="perfil-banner-skeleton"></div>
          <div className="perfil-avatar-skeleton"></div>
          <div className="perfil-content-skeleton">
            <div className="skeleton-text title"></div>
            <div className="skeleton-text subtitle"></div>
            <div className="skeleton-grid">
              <div className="skeleton-text long"></div>
              <div className="skeleton-text long"></div>
              <div className="skeleton-text long"></div>
              <div className="skeleton-text long"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- LÓGICA DO LINK DE INDICAÇÃO ATUALIZADA ---
  const friendlyConsultantName = createUrlFriendlyName(user.name);
  const indicationLink = `https://areadocliente.goldenbrasil.com.br/cadastro?ref=${user.id}&consultor=${friendlyConsultantName}`;

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
        <p>Visualize e gerencie suas informações pessoais e profissionais.</p>
      </div>

      <div className="card-base perfil-card">
        <div className="perfil-banner"></div>
        <div className="perfil-avatar">{getInitials(user.name)}</div>

        <div className="perfil-content">
          <div className="perfil-header-info">
            <h2 className="perfil-name">{user.name}</h2>
            <span className="perfil-role">Consultor(a) Golden & Diamond</span>
          </div>

          <div className="perfil-details-grid">
            <div className="detail-item">
              <label><i className="fa-solid fa-envelope"></i> Email</label>
              <span>{user.email}</span>
            </div>
            <div className="detail-item">
              <label><i className="fa-solid fa-phone"></i> Telefone</label>
              <span>{user.phoneNumber || 'Não informado'}</span>
            </div>
            <div className="detail-item">
              <label><i className="fa-solid fa-id-card"></i> CPF</label>
              <span>{user.cpfCnpj}</span>
            </div>
            <div className="detail-item">
                <label><i className="fa-solid fa-cake-candles"></i> Data de Nascimento</label>
                <span>{formatDate(user.birthDate)}</span>
            </div>
             <div className="detail-item">
              <label><i className="fa-solid fa-percent"></i> Comissão Padrão</label>
              <span>{user.commissionPercentage}%</span>
            </div>
            <div className="detail-item">
              <label><i className="fa-solid fa-calendar-check"></i> Consultor Desde</label>
              <span>{formatDate(user.dateCreated)}</span>
            </div>
          </div>

          <div className="detail-item detail-item-full">
            <label><i className="fa-solid fa-link"></i> Seu Link de Indicação</label>
            <div className="indication-link-wrapper">
              <input type="text" value={indicationLink} readOnly />
              <button onClick={handleCopyLink} className={isCopied ? 'copied' : ''}>
                {isCopied ? (
                  <><i className="fa-solid fa-check"></i> Copiado!</>
                ) : (
                  <><i className="fa-solid fa-copy"></i> Copiar</>
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