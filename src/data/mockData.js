export const mockClientsData = [
  { id: 1, name: 'Evelyn Pinedo da Mota', cpf: '045.335.721-10', email: 'evelyn.mota@example.com', phone: '92984695877' },
  { id: 2, name: 'Caiuã Brandão de Mello', cpf: '075.411.521-61', email: 'caiua.brandao@example.com', phone: '17992562727' },
  { id: 3, name: 'Gilmar Alves de Mello', cpf: '018.848.708-56', email: 'gilmar.alves@example.com', phone: '67996797444' },
  { id: 4, name: 'Pedro Henrique', cpf: '123.456.789-00', email: 'pedro.henrique@gmail.com', phone: '11987654321' },
  { id: 5, name: 'Sofia Oliveira', cpf: '987.654.321-11', email: 'sofia.oliveira@example.com', phone: '21987654321' },
  { id: 6, name: 'Lucas Martins', cpf: '111.222.333-44', email: 'lucas.martins@example.com', phone: '31987654321' },
  { id: 7, name: 'Isabella Costa', cpf: '222.333.444-55', email: 'isabella.costa@example.com', phone: '41987654321' },
  { id: 8, name: 'Mateus Pereira', cpf: '333.444.555-66', email: 'mateus.pereira@example.com', phone: '51987654321' },
  { id: 9, name: 'Juliana Santos', cpf: '444.555.666-77', email: 'juliana.santos@example.com', phone: '61987654321' },
  { id: 10, name: 'Gabriel Almeida', cpf: '555.666.777-88', email: 'gabriel.almeida@example.com', phone: '71987654321' },
  { id: 11, name: 'Beatriz Lima', cpf: '666.777.888-99', email: 'beatriz.lima@example.com', phone: '81987654321' },
  { id: 12, name: 'Rafael Ferreira', cpf: '777.888.999-00', email: 'rafael.ferreira@example.com', phone: '85987654321' },
];

export const consultantsList = [
  { id: 1, name: 'Juliana Santos', avatar: 'JS' },
  { id: 2, name: 'Rafael Ferreira', avatar: 'RF' },
  { id: 3, name: 'Beatriz Lima', avatar: 'BL' },
  { id: 4, name: 'Gabriel Almeida', avatar: 'GA' },
  { id: 5, name: 'Mateus Pereira', avatar: 'MP' },
  { id: 6, name: 'Isabella Costa', avatar: 'IC' },
  { id: 7, name: 'Lucas Martins', avatar: 'LM' },
  { id: 8, name: 'Sofia Oliveira', avatar: 'SO' },
  { id: 9, name: 'Pedro Henrique', avatar: 'PH' },
  { id: 10, name: 'Gilmar Alves de Mello', avatar: 'GM' },
  { id: 11, name: 'Caiuã Brandão de Mello', avatar: 'CB' },
  { id: 12, name: 'Evelyn Pinedo da Mota', avatar: 'EM' },
  // Nosso consultor logado
  { id: 13, name: 'Pedro Striquer', avatar: 'PS' },
];

// ID do nosso consultor logado (para a lógica de destaque)
export const LOGGED_CONSULTANT_ID = 13;

export const mockContractsData = [
  // Vendas de consultores com alto volume
  { id: 1, clientId: 1, consultantId: 1, value: 3000000.00, startDate: '17/08/2025', endDate: '17/08/2027', status: 'Valorizando', finalValorizationPercentage: 150, currentProgress: 75 },
  { id: 3, clientId: 2, consultantId: 2, value: 5000000.00, startDate: '17/08/2025', endDate: '17/08/2027', status: 'Valorizando', finalValorizationPercentage: 150, currentProgress: 80 },
  { id: 18, clientId: 1, consultantId: 1, value: 1800000.00, startDate: '12/01/2025', endDate: '12/01/2028', status: 'Valorizando', finalValorizationPercentage: 150, currentProgress: 50 },
  { id: 19, clientId: 2, consultantId: 2, value: 2500000.00, startDate: '10/05/2025', endDate: '10/05/2029', status: 'Valorizando', finalValorizationPercentage: 150, currentProgress: 33 },
  { id: 4, clientId: 3, consultantId: 3, value: 1297499.00, startDate: '17/08/2025', endDate: '17/08/2026', status: 'Valorizando', finalValorizationPercentage: 150, currentProgress: 60 },
  { id: 5, clientId: 3, consultantId: 4, value: 1569000.00, startDate: '17/08/2025', endDate: '17/08/2030', status: 'Valorizando', finalValorizationPercentage: 150, currentProgress: 45 },
  { id: 6, clientId: 3, consultantId: 5, value: 990500.00, startDate: '17/08/2025', endDate: '17/08/2026', status: 'Valorizando', finalValorizationPercentage: 150, currentProgress: 60 },
  { id: 8, clientId: 5, consultantId: 6, value: 850000.00, startDate: '10/11/2025', endDate: '10/11/2029', status: 'Valorizando', finalValorizationPercentage: 150, currentProgress: 30 },
  { id: 9, clientId: 5, consultantId: 7, value: 400000.00, startDate: '10/11/2025', endDate: '10/11/2029', status: 'Valorizando', finalValorizationPercentage: 150, currentProgress: 30 },
  { id: 16, clientId: 11, consultantId: 8, value: 600000.00, startDate: '09/10/2025', endDate: '09/10/2029', status: 'Valorizando', finalValorizationPercentage: 150, currentProgress: 35 },
  { id: 12, clientId: 7, consultantId: 9, value: 750000.00, startDate: '01/02/2025', endDate: '01/02/2029', status: 'Valorizando', finalValorizationPercentage: 150, currentProgress: 25 },
  { id: 13, clientId: 8, consultantId: 10, value: 220000.00, startDate: '03/04/2025', endDate: '03/04/2027', status: 'Valorizando', finalValorizationPercentage: 150, currentProgress: 55 },
  // Vendas do nosso consultor (Manual - ID 13) para colocá-lo fora do top 10
  { id: 7, clientId: 4, consultantId: 13, value: 50000.00, startDate: '01/01/2025', endDate: '01/01/2028', status: 'Valorizando', finalValorizationPercentage: 150, currentProgress: 20 },
  { id: 11, clientId: 6, consultantId: 13, value: 120000.00, startDate: '06/07/2025', endDate: '06/07/2028', status: 'Valorizando', finalValorizationPercentage: 150, currentProgress: 40 },
  // Contratos cancelados ou de outros consultores
  { id: 2, clientId: 1, consultantId: 1, value: 1500000.00, startDate: '17/08/2023', endDate: '17/08/2030', status: 'Cancelado', finalValorizationPercentage: 150, currentProgress: 10 },
  { id: 10, clientId: 6, consultantId: 11, value: 25000.00, startDate: '05/05/2024', endDate: '05/05/2026', status: 'Cancelado', finalValorizationPercentage: 150, currentProgress: 5 },
  { id: 14, clientId: 9, consultantId: 12, value: 300000.00, startDate: '05/06/2025', endDate: '05/06/2028', status: 'Valorizando', finalValorizationPercentage: 150, currentProgress: 40 },
  { id: 15, clientId: 10, consultantId: 11, value: 95000.00, startDate: '07/08/2022', endDate: '07/08/2026', status: 'Valorizando', finalValorizationPercentage: 150, currentProgress: 65 },
  { id: 17, clientId: 12, consultantId: 12, value: 125000.00, startDate: '11/12/2023', endDate: '11/12/2027', status: 'Valorizando', finalValorizationPercentage: 150, currentProgress: 50 },
  { id: 20, clientId: 8, consultantId: 10, value: 500000.00, startDate: '08/09/2023', endDate: '08/09/2030', status: 'Valorizando', finalValorizationPercentage: 150, currentProgress: 15 },
];

export const mockWithdrawalsData = [
    { id: 1, clientId: 1, value: 100000.00, date: '20/06/2025', status: 'Concluído' },
    { id: 2, clientId: 3, value: 50000.00, date: '15/07/2025', status: 'Concluído' },
    { id: 3, clientId: 5, value: 20000.00, date: '01/08/2025', status: 'Concluído' },
    { id: 4, clientId: 7, value: 35000.00, date: '10/08/2025', status: 'Concluído' },
    { id: 5, clientId: 2, value: 150000.00, date: '12/08/2025', status: 'Concluído' },
    { id: 6, clientId: 9, value: 10000.00, date: '15/08/2025', status: 'Concluído' },
];

export const consultantProfileData = {
  name: 'Pedro Striquer',
  role: 'Consultor',
  email: 'pedro.striquer@gemas.com',
  cpf: '123.456.789-10',
  indicationLink: 'https://gemasbrilhantes.com/ref/pedro.striquer',
  commissionPercentage: 10,
};

export const mockConsultantWithdrawalsData = [
  { id: 'cw-1', date: '15/08/2025', value: 15000.00, description: 'Saque para conta bancária' },
  { id: 'cw-2', date: '01/08/2025', value: 25000.00, description: 'Saque para conta bancária' },
  { id: 'cw-3', date: '10/07/2025', value: 12500.00, description: 'Saque para conta bancária' },
];