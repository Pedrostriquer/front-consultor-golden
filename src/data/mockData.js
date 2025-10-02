export const mockClientsData = [
  // Golden Brasil
  { id: 1, name: 'Evelyn Pinedo da Mota', cpfCnpj: '045.335.721-10', email: 'evelyn.mota@example.com', phoneNumber: '92984695877', balance: 150000, platform: 'Golden Brasil' },
  { id: 2, name: 'Caiuã Brandão de Mello', cpfCnpj: '075.411.521-61', email: 'caiua.brandao@example.com', phoneNumber: '17992562727', balance: 250000, platform: 'Golden Brasil' },
  { id: 3, name: 'Gilmar Alves de Mello', cpfCnpj: '018.848.708-56', email: 'gilmar.alves@example.com', phoneNumber: '67996797444', balance: 75000, platform: 'Golden Brasil' },
  { id: 4, name: 'Pedro Henrique', cpfCnpj: '123.456.789-00', email: 'pedro.henrique@gmail.com', phoneNumber: '11987654321', balance: 50000, platform: 'Golden Brasil' },
  { id: 5, name: 'Sofia Oliveira', cpfCnpj: '987.654.321-11', email: 'sofia.oliveira@example.com', phoneNumber: '21987654321', balance: 120000, platform: 'Golden Brasil' },
  // Diamond Prime
  { id: 6, name: 'Lucas Martins', cpfCnpj: '111.222.333-44', email: 'lucas.martins@example.com', phoneNumber: '31987654321', balance: 300000, platform: 'Diamond Prime' },
  { id: 7, name: 'Isabella Costa', cpfCnpj: '222.333.444-55', email: 'isabella.costa@example.com', phoneNumber: '41987654321', balance: 500000, platform: 'Diamond Prime' },
  { id: 8, name: 'Mateus Pereira', cpfCnpj: '333.444.555-66', email: 'mateus.pereira@example.com', phoneNumber: '51987654321', balance: 95000, platform: 'Diamond Prime' },
  { id: 9, name: 'Juliana Santos', cpfCnpj: '444.555.666-77', email: 'juliana.santos@example.com', phoneNumber: '61987654321', balance: 30000, platform: 'Diamond Prime' },
  { id: 10, name: 'Gabriel Almeida', cpfCnpj: '555.666.777-88', email: 'gabriel.almeida@example.com', phoneNumber: '71987654321', balance: 180000, platform: 'Diamond Prime' },
  // Novos Clientes
  { id: 11, name: 'Beatriz Lima', cpfCnpj: '666.777.888-99', email: 'beatriz.lima@example.com', phoneNumber: '81987654321', balance: 45000, platform: 'Golden Brasil' },
  { id: 12, name: 'Felipe Azevedo', cpfCnpj: '777.888.999-00', email: 'felipe.azevedo@example.com', phoneNumber: '85987654321', balance: 220000, platform: 'Diamond Prime' },
  { id: 13, name: 'Laura Carvalho', cpfCnpj: '888.999.000-11', email: 'laura.carvalho@example.com', phoneNumber: '98987654321', balance: 130000, platform: 'Golden Brasil' },
];

export const mockContractsData = [
  // Golden Brasil
  { id: 101, clientId: 1, amount: 50000, finalAmount: 75000, currentIncome: 12500, gainPercentage: 5, duration: 24, status: 2, commissionExists: true, commissionAmount: 5000, commissionStatus: 2, dateCreated: '2023-01-15T10:00:00Z', activationDate: '2023-01-20T10:00:00Z', endContractDate: '2025-01-20T10:00:00Z', clientName: 'Evelyn Pinedo da Mota', platform: 'Golden Brasil' },
  { id: 102, clientId: 1, amount: 100000, finalAmount: 150000, currentIncome: 25000, gainPercentage: 5, duration: 24, status: 2, commissionExists: true, commissionAmount: 10000, commissionStatus: 1, dateCreated: '2023-03-20T10:00:00Z', activationDate: '2023-03-25T10:00:00Z', endContractDate: '2025-03-25T10:00:00Z', clientName: 'Evelyn Pinedo da Mota', platform: 'Golden Brasil' },
  { id: 103, clientId: 2, amount: 250000, finalAmount: 375000, currentIncome: 62500, gainPercentage: 5, duration: 24, status: 4, commissionExists: true, commissionAmount: 25000, commissionStatus: 2, dateCreated: '2022-05-10T10:00:00Z', activationDate: '2022-05-15T10:00:00Z', endContractDate: '2024-05-15T10:00:00Z', clientName: 'Caiuã Brandão de Mello', platform: 'Golden Brasil' },
  { id: 104, clientId: 3, amount: 75000, finalAmount: 112500, currentIncome: 18750, gainPercentage: 5, duration: 24, status: 2, commissionExists: true, commissionAmount: 7500, commissionStatus: 2, dateCreated: '2023-08-01T10:00:00Z', activationDate: '2023-08-05T10:00:00Z', endContractDate: '2025-08-05T10:00:00Z', clientName: 'Gilmar Alves de Mello', platform: 'Golden Brasil' },
  { id: 105, clientId: 4, amount: 50000, finalAmount: 75000, currentIncome: 12500, gainPercentage: 5, duration: 24, status: 3, commissionExists: false, commissionAmount: 0, commissionStatus: 3, dateCreated: '2023-09-01T10:00:00Z', activationDate: null, endContractDate: '2025-09-01T10:00:00Z', clientName: 'Pedro Henrique', platform: 'Golden Brasil' },
  // Diamond Prime
  { id: 201, clientId: 6, amount: 100000, finalAmount: 150000, currentIncome: 25000, gainPercentage: 5, duration: 24, status: 2, commissionExists: true, commissionAmount: 10000, commissionStatus: 2, dateCreated: '2023-02-10T10:00:00Z', activationDate: '2023-02-15T10:00:00Z', endContractDate: '2025-02-15T10:00:00Z', clientName: 'Lucas Martins', platform: 'Diamond Prime' },
  { id: 202, clientId: 7, amount: 200000, finalAmount: 300000, currentIncome: 50000, gainPercentage: 5, duration: 24, status: 2, commissionExists: true, commissionAmount: 20000, commissionStatus: 1, dateCreated: '2023-04-05T10:00:00Z', activationDate: '2023-04-10T10:00:00Z', endContractDate: '2025-04-10T10:00:00Z', clientName: 'Isabella Costa', platform: 'Diamond Prime' },
  { id: 203, clientId: 8, amount: 50000, finalAmount: 75000, currentIncome: 12500, gainPercentage: 5, duration: 24, status: 2, commissionExists: true, commissionAmount: 5000, commissionStatus: 2, dateCreated: '2023-06-15T10:00:00Z', activationDate: '2023-06-20T10:00:00Z', endContractDate: '2025-06-20T10:00:00Z', clientName: 'Mateus Pereira', platform: 'Diamond Prime' },
  { id: 204, clientId: 9, amount: 30000, finalAmount: 45000, currentIncome: 7500, gainPercentage: 5, duration: 24, status: 4, commissionExists: true, commissionAmount: 3000, commissionStatus: 2, dateCreated: '2022-07-20T10:00:00Z', activationDate: '2022-07-25T10:00:00Z', endContractDate: '2024-07-25T10:00:00Z', clientName: 'Juliana Santos', platform: 'Diamond Prime' },
  { id: 205, clientId: 10, amount: 180000, finalAmount: 270000, currentIncome: 45000, gainPercentage: 5, duration: 24, status: 2, commissionExists: true, commissionAmount: 18000, commissionStatus: 2, dateCreated: '2023-10-10T10:00:00Z', activationDate: '2023-10-15T10:00:00Z', endContractDate: '2025-10-15T10:00:00Z', clientName: 'Gabriel Almeida', platform: 'Diamond Prime' },
  // Novos Contratos
  { id: 106, clientId: 11, amount: 45000, finalAmount: 67500, currentIncome: 5000, gainPercentage: 5, duration: 24, status: 2, commissionExists: true, commissionAmount: 4500, commissionStatus: 2, dateCreated: '2023-11-05T10:00:00Z', activationDate: '2023-11-10T10:00:00Z', endContractDate: '2025-11-10T10:00:00Z', clientName: 'Beatriz Lima', platform: 'Golden Brasil' },
  { id: 206, clientId: 12, amount: 220000, finalAmount: 330000, currentIncome: 30000, gainPercentage: 5, duration: 24, status: 2, commissionExists: true, commissionAmount: 22000, commissionStatus: 1, dateCreated: '2023-11-15T10:00:00Z', activationDate: '2023-11-20T10:00:00Z', endContractDate: '2025-11-20T10:00:00Z', clientName: 'Felipe Azevedo', platform: 'Diamond Prime' },
  { id: 107, clientId: 13, amount: 130000, finalAmount: 195000, currentIncome: 15000, gainPercentage: 5, duration: 24, status: 1, commissionExists: true, commissionAmount: 13000, commissionStatus: 1, dateCreated: '2023-12-01T10:00:00Z', activationDate: null, endContractDate: '2025-12-01T10:00:00Z', clientName: 'Laura Carvalho', platform: 'Golden Brasil' },
];

export const mockWithdrawsData = [
{ id: 1, clientId: 1, amountWithdrawn: 10000, amountReceivable: 9800, dateCreated: '2023-10-28T14:00:00Z', status: 2 },
{ id: 2, clientId: 2, amountWithdrawn: 25000, amountReceivable: 24500, dateCreated: '2023-11-15T11:30:00Z', status: 1 },
{ id: 3, clientId: 1, amountWithdrawn: 5000, amountReceivable: 4900, dateCreated: '2023-12-01T09:00:00Z', status: 3 },
];

export const mockConsultantWithdrawsData = {
totalCount: 5,
pageSize: 10,
items: [
{ id: 1, dateCreated: '2023-12-01T10:00:00Z', amountWithdrawn: 500.00, status: 2 },
{ id: 2, dateCreated: '2023-11-15T14:30:00Z', amountWithdrawn: 1200.00, status: 2 },
{ id: 3, dateCreated: '2023-11-01T09:00:00Z', amountWithdrawn: 750.00, status: 1 },
{ id: 4, dateCreated: '2023-10-20T18:00:00Z', amountWithdrawn: 200.00, status: 3 },
{ id: 5, dateCreated: '2023-10-05T11:00:00Z', amountWithdrawn: 2500.00, status: 2 },
]
};

export const mockConsultantExtractData = {
totalCount: 11,
pageSize: 10,
items: [
{ type: 'Credit', transactionId: 101, description: 'Comissão recebida do contrato #101', date: '2023-12-05T10:00:00Z', amount: 5000.00 },
{ type: 'Debit', transactionId: 1, description: 'Saque solicitado', date: '2023-12-01T10:00:00Z', amount: 500.00 },
{ type: 'Credit', transactionId: 103, description: 'Comissão recebida do contrato #103', date: '2023-11-20T10:00:00Z', amount: 25000.00 },
{ type: 'Debit', transactionId: 2, description: 'Saque solicitado', date: '2023-11-15T14:30:00Z', amount: 1200.00 },
{ type: 'Credit', transactionId: 104, description: 'Comissão recebida do contrato #104', date: '2023-11-05T10:00:00Z', amount: 7500.00 },
{ type: 'Debit', transactionId: 5, description: 'Saque solicitado', date: '2023-10-05T11:00:00Z', amount: 2500.00 },
// Novas transações
{ type: 'Credit', transactionId: 201, description: 'Comissão recebida do contrato #201', date: '2023-09-15T10:00:00Z', amount: 10000.00 },
{ type: 'Credit', transactionId: 203, description: 'Comissão recebida do contrato #203', date: '2023-08-20T10:00:00Z', amount: 5000.00 },
{ type: 'Debit', transactionId: 3, description: 'Saque solicitado', date: '2023-07-01T09:00:00Z', amount: 750.00 },
{ type: 'Credit', transactionId: 204, description: 'Comissão recebida do contrato #204', date: '2023-06-25T10:00:00Z', amount: 3000.00 },
{ type: 'Credit', transactionId: 205, description: 'Comissão recebida do contrato #205', date: '2023-05-10T10:00:00Z', amount: 18000.00 },
]
};

export const mockDashboardData = {
totalClients: 13,
totalCommissionThisMonth: 37500.00,
totalPendingCommissionThisMonth: 10000.00,
totalCommissionThisYear: 180000.00,
monthlyCommissionData: [
  { month: 'Jul', commission: 12000 },
  { month: 'Ago', commission: 15000 },
  { month: 'Set', commission: 10000 },
  { month: 'Out', commission: 22000 },
  { month: 'Nov', commission: 32500 },
  { month: 'Dez', commission: 37500 },
],
bestClients: [
  { id: 7, name: 'Isabella Costa', balance: 500000, platform: 'Diamond Prime', cpfCnpj: '222.333.444-55' },
  { id: 6, name: 'Lucas Martins', balance: 300000, platform: 'Diamond Prime', cpfCnpj: '111.222.333-44' },
  { id: 2, name: 'Caiuã Brandão de Mello', balance: 250000, platform: 'Golden Brasil', cpfCnpj: '075.411.521-61' },
  { id: 12, name: 'Felipe Azevedo', balance: 220000, platform: 'Diamond Prime', cpfCnpj: '777.888.999-00' },
  { id: 10, name: 'Gabriel Almeida', balance: 180000, platform: 'Diamond Prime', cpfCnpj: '555.666.777-88' },
],
platformStats: {
  clientDistribution: { golden: 46.2, diamond: 53.8, },
  commissionDistribution: { golden: 42.1, diamond: 57.9, },
  totalCommission: { golden: 75000, diamond: 105000, }
},
ranking: [
    { id: 1, name: 'Juliana Santos', rank: 1 },
    { id: 2, name: 'Rafael Ferreira', rank: 2 },
    { id: 3, name: 'Consultor Golden', rank: 8 },
    { id: 4, name: 'Amanda Souza', rank: 4 },
    { id: 5, name: 'Bruno Costa', rank: 5 },
],
currentConsultantRankInfo: {
    id: 3, name: 'Consultor Golden', rank: 8 
}
};