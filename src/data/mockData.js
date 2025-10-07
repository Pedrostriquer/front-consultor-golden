// src/data/mockData.js

// ===================================================================
// =================== MOCK DATA PARA ÁREA DO ADMIN ==================
// ===================================================================

/**
 * Lista de Consultores para a área do admin.
 * Cada consultor tem suas próprias comissões e listas de IDs de clientes e vendas.
 */
export const mockAdminConsultants = [
  {
    id: 1,
    name: 'Carlos Alberto de Nóbrega',
    email: 'carlos.nobrega@example.com',
    cpfCnpj: '111.222.333-44',
    phoneNumber: '(11) 98765-4321',
    birthDate: '1970-05-15',
    dateCreated: '2022-01-20T10:00:00Z',
    commissionPercentage: 5,
    currentMonthCommission: 7500.50,
    pendingMonthCommission: 2500.00,
    clientIds: [1, 2, 3, 16],
    saleIds: [101, 102, 103, 116],
    metas: [
      { level: 1, value: 0, commission_percentage: 3 },
      { level: 2, value: 10000, commission_percentage: 4 },
      { level: 3, value: 25000, commission_percentage: 5 },
    ]
  },
  {
    id: 2,
    name: 'Fernanda Montenegro',
    email: 'fernanda.montenegro@example.com',
    cpfCnpj: '222.333.444-55',
    phoneNumber: '(21) 99876-5432',
    birthDate: '1965-10-10',
    dateCreated: '2021-11-15T10:00:00Z',
    commissionPercentage: 6,
    currentMonthCommission: 12800.00,
    pendingMonthCommission: 4500.75,
    clientIds: [4, 5, 17],
    saleIds: [104, 105, 117],
    metas: [
      { level: 1, value: 0, commission_percentage: 4 },
      { level: 2, value: 15000, commission_percentage: 5 },
      { level: 3, value: 30000, commission_percentage: 6 },
    ]
  },
  {
    id: 3,
    name: 'Rodrigo Santoro',
    email: 'rodrigo.santoro@example.com',
    cpfCnpj: '333.444.555-66',
    phoneNumber: '(31) 98888-7777',
    birthDate: '1980-03-25',
    dateCreated: '2023-02-10T10:00:00Z',
    commissionPercentage: 4.5,
    currentMonthCommission: 5600.20,
    pendingMonthCommission: 1200.00,
    clientIds: [6, 7, 18],
    saleIds: [106, 107, 118],
    metas: [
        { level: 1, value: 0, commission_percentage: 2.5 },
        { level: 2, value: 8000, commission_percentage: 3.5 },
        { level: 3, value: 20000, commission_percentage: 4.5 },
    ]
  },
  {
    id: 4,
    name: 'Wagner Moura',
    email: 'wagner.moura@example.com',
    cpfCnpj: '444.555.666-77',
    phoneNumber: '(71) 97777-8888',
    birthDate: '1978-08-01',
    dateCreated: '2022-08-05T10:00:00Z',
    commissionPercentage: 5.5,
    currentMonthCommission: 9850.00,
    pendingMonthCommission: 3200.50,
    clientIds: [8, 9, 19, 20],
    saleIds: [108, 109, 119, 120],
    metas: [
        { level: 1, value: 0, commission_percentage: 3 },
        { level: 2, value: 12000, commission_percentage: 4.5 },
        { level: 3, value: 28000, commission_percentage: 5.5 },
    ]
  },
  {
    id: 5,
    name: 'Alice Braga',
    email: 'alice.braga@example.com',
    cpfCnpj: '555.666.777-88',
    phoneNumber: '(11) 96666-5555',
    birthDate: '1985-12-30',
    dateCreated: '2023-01-05T10:00:00Z',
    commissionPercentage: 5,
    currentMonthCommission: 8200.00,
    pendingMonthCommission: 1800.00,
    clientIds: [10, 11],
    saleIds: [110, 111],
    metas: [
        { level: 1, value: 0, commission_percentage: 3 },
        { level: 2, value: 10000, commission_percentage: 5 },
    ]
  },
  {
    id: 6,
    name: 'Lázaro Ramos',
    email: 'lazaro.ramos@example.com',
    cpfCnpj: '666.777.888-99',
    phoneNumber: '(21) 95555-4444',
    birthDate: '1975-09-20',
    dateCreated: '2022-05-18T10:00:00Z',
    commissionPercentage: 6,
    currentMonthCommission: 15400.80,
    pendingMonthCommission: 5800.00,
    clientIds: [12, 13],
    saleIds: [112, 113],
    metas: [
        { level: 1, value: 0, commission_percentage: 4 },
        { level: 2, value: 20000, commission_percentage: 5 },
        { level: 3, value: 40000, commission_percentage: 6 },
    ]
  },
  {
    id: 7,
    name: 'Sônia Braga',
    email: 'sonia.braga@example.com',
    cpfCnpj: '777.888.999-00',
    phoneNumber: '(11) 94444-3333',
    birthDate: '1958-06-08',
    dateCreated: '2020-03-12T10:00:00Z',
    commissionPercentage: 7,
    currentMonthCommission: 21500.00,
    pendingMonthCommission: 8500.25,
    clientIds: [14, 15],
    saleIds: [114, 115],
    metas: [
        { level: 1, value: 0, commission_percentage: 5 },
        { level: 2, value: 25000, commission_percentage: 6 },
        { level: 3, value: 50000, commission_percentage: 7 },
    ]
  },
  {
    id: 8,
    name: 'Pedro Pascal',
    email: 'pedro.pascal@example.com',
    cpfCnpj: '888.999.000-11',
    phoneNumber: '(41) 93333-2222',
    birthDate: '1975-04-02',
    dateCreated: '2023-05-20T10:00:00Z',
    commissionPercentage: 5,
    currentMonthCommission: 0,
    pendingMonthCommission: 0,
    clientIds: [],
    saleIds: [],
    metas: []
  },
];

/**
 * Lista de Clientes para a área do admin.
 * Cada cliente está associado a um consultor pelo `consultantId`.
 */
export const mockAdminClients = [
    // Clientes do Carlos Alberto
    { id: 1, consultantId: 1, name: 'João da Silva', cpfCnpj: '123.456.789-01', email: 'joao.silva@email.com', phoneNumber: '(11) 91111-1111', dateCreated: '2023-01-15T10:00:00Z', platformId: 'CONTRATO_DE_MINERIOS', status: 1 },
    { id: 2, consultantId: 1, name: 'Maria Oliveira', cpfCnpj: '123.456.789-02', email: 'maria.oliveira@email.com', phoneNumber: '(11) 92222-2222', dateCreated: '2023-02-20T10:00:00Z', platformId: 'DIAMOND_PRIME', status: 1 },
    { id: 3, consultantId: 1, name: 'Pedro Santos', cpfCnpj: '123.456.789-03', email: 'pedro.santos@email.com', phoneNumber: '(11) 93333-3333', dateCreated: '2023-03-25T10:00:00Z', platformId: 'CONTRATO_DE_MINERIOS', status: 0 },
    // Clientes da Fernanda Montenegro
    { id: 4, consultantId: 2, name: 'Ana Souza', cpfCnpj: '234.567.890-11', email: 'ana.souza@email.com', phoneNumber: '(21) 94444-4444', dateCreated: '2022-12-10T10:00:00Z', platformId: 'DIAMOND_PRIME', status: 1 },
    { id: 5, consultantId: 2, name: 'Lucas Pereira', cpfCnpj: '234.567.890-12', email: 'lucas.pereira@email.com', phoneNumber: '(21) 95555-5555', dateCreated: '2023-01-05T10:00:00Z', platformId: 'DIAMOND_PRIME', status: 1 },
    // Clientes do Rodrigo Santoro
    { id: 6, consultantId: 3, name: 'Juliana Costa', cpfCnpj: '345.678.901-21', email: 'juliana.costa@email.com', phoneNumber: '(31) 96666-6666', dateCreated: '2023-03-01T10:00:00Z', platformId: 'CONTRATO_DE_MINERIOS', status: 1 },
    { id: 7, consultantId: 3, name: 'Marcos Almeida', cpfCnpj: '345.678.901-22', email: 'marcos.almeida@email.com', phoneNumber: '(31) 97777-7777', dateCreated: '2023-04-10T10:00:00Z', platformId: 'DIAMOND_PRIME', status: 1 },
    // Clientes do Wagner Moura
    { id: 8, consultantId: 4, name: 'Beatriz Lima', cpfCnpj: '456.789.012-31', email: 'beatriz.lima@email.com', phoneNumber: '(71) 98888-8888', dateCreated: '2022-09-15T10:00:00Z', platformId: 'CONTRATO_DE_MINERIOS', status: 1 },
    { id: 9, consultantId: 4, name: 'Carlos Ferreira', cpfCnpj: '456.789.012-32', email: 'carlos.ferreira@email.com', phoneNumber: '(71) 99999-9999', dateCreated: '2022-10-20T10:00:00Z', platformId: 'DIAMOND_PRIME', status: 0 },
    // Clientes da Alice Braga
    { id: 10, consultantId: 5, name: 'Fernanda Rocha', cpfCnpj: '567.890.123-41', email: 'fernanda.rocha@email.com', phoneNumber: '(11) 91234-5678', dateCreated: '2023-02-15T10:00:00Z', platformId: 'CONTRATO_DE_MINERIOS', status: 1 },
    { id: 11, consultantId: 5, name: 'Ricardo Nunes', cpfCnpj: '567.890.123-42', email: 'ricardo.nunes@email.com', phoneNumber: '(11) 98765-4321', dateCreated: '2023-03-20T10:00:00Z', platformId: 'DIAMOND_PRIME', status: 1 },
    // Clientes do Lázaro Ramos
    { id: 12, consultantId: 6, name: 'Sandra Martins', cpfCnpj: '678.901.234-51', email: 'sandra.martins@email.com', phoneNumber: '(21) 92345-6789', dateCreated: '2022-06-01T10:00:00Z', platformId: 'CONTRATO_DE_MINERIOS', status: 1 },
    { id: 13, consultantId: 6, name: 'Bruno Gomes', cpfCnpj: '678.901.234-52', email: 'bruno.gomes@email.com', phoneNumber: '(21) 93456-7890', dateCreated: '2022-07-10T10:00:00Z', platformId: 'DIAMOND_PRIME', status: 1 },
    // Clientes da Sônia Braga
    { id: 14, consultantId: 7, name: 'Vanessa Barbosa', cpfCnpj: '789.012.345-61', email: 'vanessa.barbosa@email.com', phoneNumber: '(11) 94567-8901', dateCreated: '2021-04-05T10:00:00Z', platformId: 'CONTRATO_DE_MINERIOS', status: 0 },
    { id: 15, consultantId: 7, name: 'Rafaela Ribeiro', cpfCnpj: '789.012.345-62', email: 'rafaela.ribeiro@email.com', phoneNumber: '(11) 95678-9012', dateCreated: '2021-05-15T10:00:00Z', platformId: 'DIAMOND_PRIME', status: 1 },
    // Clientes adicionais
    { id: 16, consultantId: 1, name: 'José Abreu', cpfCnpj: '111.111.111-11', email: 'jose.abreu@email.com', phoneNumber: '(11) 91111-2222', dateCreated: '2023-04-01T10:00:00Z', platformId: 'CONTRATO_DE_MINERIOS', status: 1 },
    { id: 17, consultantId: 2, name: 'Camila Pitanga', cpfCnpj: '222.222.222-22', email: 'camila.pitanga@email.com', phoneNumber: '(21) 92222-3333', dateCreated: '2023-04-02T10:00:00Z', platformId: 'DIAMOND_PRIME', status: 1 },
    { id: 18, consultantId: 3, name: 'Cauã Reymond', cpfCnpj: '333.333.333-33', email: 'caua.reymond@email.com', phoneNumber: '(31) 93333-4444', dateCreated: '2023-04-03T10:00:00Z', platformId: 'CONTRATO_DE_MINERIOS', status: 1 },
    { id: 19, consultantId: 4, name: 'Mariana Ximenes', cpfCnpj: '444.444.444-44', email: 'mariana.ximenes@email.com', phoneNumber: '(71) 94444-5555', dateCreated: '2023-04-04T10:00:00Z', platformId: 'DIAMOND_PRIME', status: 1 },
    { id: 20, consultantId: 4, name: 'Taís Araújo', cpfCnpj: '555.555.555-55', email: 'tais.araujo@email.com', phoneNumber: '(21) 95555-6666', dateCreated: '2023-04-05T10:00:00Z', platformId: 'DIAMOND_PRIME', status: 1 },
];


/**
 * Lista de Vendas para a área do admin.
 * Cada venda está associada a um consultor e a um cliente.
 */
export const mockAdminSales = [
    // Vendas do Carlos Alberto
    { id: 101, consultantId: 1, clientId: 1, clientName: 'João da Silva', clientCpfCnpj: '123.456.789-01', value: 50000, commissionValue: 2500, dateCreated: '2023-01-15T11:00:00Z', status: 'RECEBIDO', platformId: 'CONTRATO_DE_MINERIOS' },
    { id: 102, consultantId: 1, clientId: 2, clientName: 'Maria Oliveira', clientCpfCnpj: '123.456.789-02', value: 100000, commissionValue: 5000.50, dateCreated: '2023-02-20T11:00:00Z', status: 'RECEBIDO', platformId: 'DIAMOND_PRIME' },
    { id: 103, consultantId: 1, clientId: 3, clientName: 'Pedro Santos', clientCpfCnpj: '123.456.789-03', value: 75000, commissionValue: 3750, dateCreated: '2023-03-25T11:00:00Z', status: 'CANCELADO', platformId: 'CONTRATO_DE_MINERIOS' },
    // Vendas da Fernanda Montenegro
    { id: 104, consultantId: 2, clientId: 4, clientName: 'Ana Souza', clientCpfCnpj: '234.567.890-11', value: 200000, commissionValue: 12000, dateCreated: '2022-12-10T11:00:00Z', status: 'RECEBIDO', platformId: 'DIAMOND_PRIME' },
    { id: 105, consultantId: 2, clientId: 5, clientName: 'Lucas Pereira', clientCpfCnpj: '234.567.890-12', value: 80000, commissionValue: 4800.75, dateCreated: '2023-01-05T11:00:00Z', status: 'PENDENTE', platformId: 'DIAMOND_PRIME' },
    // Vendas do Rodrigo Santoro
    { id: 106, consultantId: 3, clientId: 6, clientName: 'Juliana Costa', clientCpfCnpj: '345.678.901-21', value: 60000, commissionValue: 2700, dateCreated: '2023-03-01T11:00:00Z', status: 'VENDIDO', platformId: 'CONTRATO_DE_MINERIOS' },
    { id: 107, consultantId: 3, clientId: 7, clientName: 'Marcos Almeida', clientCpfCnpj: '345.678.901-22', value: 150000, commissionValue: 6750.20, dateCreated: '2023-04-10T11:00:00Z', status: 'RECEBIDO', platformId: 'DIAMOND_PRIME' },
    // Vendas do Wagner Moura
    { id: 108, consultantId: 4, clientId: 8, clientName: 'Beatriz Lima', clientCpfCnpj: '456.789.012-31', value: 95000, commissionValue: 5225, dateCreated: '2022-09-15T11:00:00Z', status: 'RECEBIDO', platformId: 'CONTRATO_DE_MINERIOS' },
    { id: 109, consultantId: 4, clientId: 9, clientName: 'Carlos Ferreira', clientCpfCnpj: '456.789.012-32', value: 40000, commissionValue: 2200, dateCreated: '2022-10-20T11:00:00Z', status: 'CANCELADO', platformId: 'DIAMOND_PRIME' },
    // Vendas da Alice Braga
    { id: 110, consultantId: 5, clientId: 10, clientName: 'Fernanda Rocha', clientCpfCnpj: '567.890.123-41', value: 120000, commissionValue: 6000, dateCreated: '2023-02-15T11:00:00Z', status: 'RECEBIDO', platformId: 'CONTRATO_DE_MINERIOS' },
    { id: 111, consultantId: 5, clientId: 11, clientName: 'Ricardo Nunes', clientCpfCnpj: '567.890.123-42', value: 55000, commissionValue: 2750, dateCreated: '2023-03-20T11:00:00Z', status: 'VENDIDO', platformId: 'DIAMOND_PRIME' },
    // Vendas do Lázaro Ramos
    { id: 112, consultantId: 6, clientId: 12, clientName: 'Sandra Martins', clientCpfCnpj: '678.901.234-51', value: 250000, commissionValue: 15000.80, dateCreated: '2022-06-01T11:00:00Z', status: 'RECEBIDO', platformId: 'CONTRATO_DE_MINERIOS' },
    { id: 113, consultantId: 6, clientId: 13, clientName: 'Bruno Gomes', clientCpfCnpj: '678.901.234-52', value: 70000, commissionValue: 4200, dateCreated: '2022-07-10T11:00:00Z', status: 'PENDENTE', platformId: 'DIAMOND_PRIME' },
    // Vendas da Sônia Braga
    { id: 114, consultantId: 7, clientId: 14, clientName: 'Vanessa Barbosa', clientCpfCnpj: '789.012.345-61', value: 300000, commissionValue: 21000, dateCreated: '2021-04-05T11:00:00Z', status: 'RECEBIDO', platformId: 'CONTRATO_DE_MINERIOS' },
    { id: 115, consultantId: 7, clientId: 15, clientName: 'Rafaela Ribeiro', clientCpfCnpj: '789.012.345-62', value: 180000, commissionValue: 12600.25, dateCreated: '2021-05-15T11:00:00Z', status: 'RECEBIDO', platformId: 'DIAMOND_PRIME' },
    // Vendas Adicionais
    { id: 116, consultantId: 1, clientId: 16, clientName: 'José Abreu', clientCpfCnpj: '111.111.111-11', value: 50000, commissionValue: 2500, dateCreated: '2024-05-01T11:00:00Z', status: 'PENDENTE', platformId: 'CONTRATO_DE_MINERIOS' },
    { id: 117, consultantId: 2, clientId: 17, clientName: 'Camila Pitanga', clientCpfCnpj: '222.222.222-22', value: 75000, commissionValue: 4500, dateCreated: '2024-05-02T11:00:00Z', status: 'VENDIDO', platformId: 'DIAMOND_PRIME' },
    { id: 118, consultantId: 3, clientId: 18, clientName: 'Cauã Reymond', clientCpfCnpj: '333.333.333-33', value: 120000, commissionValue: 5400, dateCreated: '2024-04-03T11:00:00Z', status: 'RECEBIDO', platformId: 'CONTRATO_DE_MINERIOS' },
    { id: 119, consultantId: 4, clientId: 19, clientName: 'Mariana Ximenes', clientCpfCnpj: '444.444.444-44', value: 85000, commissionValue: 4675, dateCreated: '2024-04-04T11:00:00Z', status: 'RECEBIDO', platformId: 'DIAMOND_PRIME' },
    { id: 120, consultantId: 4, clientId: 20, clientName: 'Taís Araújo', clientCpfCnpj: '555.555.555-55', value: 92000, commissionValue: 5060, dateCreated: '2024-04-05T11:00:00Z', status: 'RECEBIDO', platformId: 'DIAMOND_PRIME' },
];