import React, { useState } from "react";
import { useAuth } from "../../Context/AuthContext"; // 1. Importa o useAuth para pegar o usuário logado
import "./Perfil.css";

const Perfil = () => {
  const { user } = useAuth(); // 2. Pega o objeto 'user' do contexto de autenticação
  const [isCopied, setIsCopied] = useState(false);

  // 3. Enquanto o 'user' não for carregado, mostra uma mensagem
  if (!user) {
    return <div>Carregando perfil...</div>;
  }

  // 4. Lógica para pegar as iniciais do nome para o avatar
  const getInitials = (name = "") => {
    const nameParts = name.trim().split(" ");
    if (nameParts.length === 1 && nameParts[0] !== "") {
      return nameParts[0].substring(0, 2).toUpperCase();
    }
    const firstInitial = nameParts[0]?.[0] || "";
    const lastInitial = nameParts[nameParts.length - 1]?.[0] || "";
    return `${firstInitial}${lastInitial}`.toUpperCase();
  };

  // 5. Gera o link de indicação dinamicamente
  // (Ajuste o '/cadastro' para a rota correta de registro de cliente, se for diferente)
  const indicationLink = `${window.location.origin}/cadastro?ref=${user.id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(indicationLink).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // Mostra a mensagem por 2 segundos
    });
  };

  return (
    <div className="perfil-page">
      <div className="page-header">
        <h1>Meu Perfil</h1>
        <p>Visualize e gerencie suas informações pessoais.</p>
      </div>

      <div className="card-base perfil-card">
        <div className="perfil-header">
          {/* Avatar com as iniciais dinâmicas */}
          <div className="perfil-avatar">{getInitials(user.name)}</div>
          <div className="perfil-header-info">
            {/* Informações do usuário do contexto */}
            <h2 className="perfil-name">{user.name}</h2>
            <span className="perfil-role">Consultor(a)</span>
          </div>
        </div>

        <div className="perfil-details-grid">
          <div className="detail-item">
            <label>Email</label>
            {/* O email vem do 'user' */}
            <span>{user.email}</span>
          </div>
          <div className="detail-item">
            <label>CPF</label>
            {/* O CPF vem do 'user'. Note que no C# é CpfCnpj, em JSON vira cpfCnpj */}
            <span>{user.cpfCnpj}</span>
          </div>
          <div className="detail-item">
            <label>Comissão</label>
            {/* A comissão vem do 'user' */}
            <span>{user.commissionPercentage}%</span>
          </div>
          <div className="detail-item detail-item-full">
            <label>Seu Link de Indicação</label>
            <div className="indication-link-wrapper">
              {/* O link de indicação agora é dinâmico */}
              <input type="text" value={indicationLink} readOnly />
              <button onClick={handleCopyLink}>
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
