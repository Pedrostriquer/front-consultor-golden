import {
    mockClientsData,
    mockContractsData,
    mockWithdrawsData,
    mockConsultantWithdrawsData,
    mockConsultantExtractData,
    mockDashboardData,
  } from '../data/mockData';
  
  const mockApiCall = (data, timeout = 500) => {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({ data });
      }, timeout);
    });
  };
  
  const searchMyClients = (params = {}) => {
    const { searchTerm = '', pageNumber = 1, pageSize = 10, minBalance, maxBalance, sortBy, sortOrder, platform } = params;
  
    let filteredClients = mockClientsData.filter(client => {
      const searchMatch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          client.cpfCnpj.includes(searchTerm) ||
                          client.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const balance = client.balance || 0;
      const minBalanceMatch = !minBalance || balance >= parseFloat(minBalance);
      const maxBalanceMatch = !maxBalance || balance <= parseFloat(maxBalance);
  
      const platformMatch = !platform || platform === 'all' || client.platform === platform;
  
      return searchMatch && minBalanceMatch && maxBalanceMatch && platformMatch;
    });
  
    if (sortBy) {
      filteredClients.sort((a, b) => {
        const valA = a[sortBy];
        const valB = b[sortBy];
        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }
  
    const paginatedClients = filteredClients.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);
  
    return mockApiCall({
      items: paginatedClients,
      totalCount: filteredClients.length,
      pageSize,
    });
  };
  
  const searchContracts = (params = {}) => {
    const { searchTerm = '', pageNumber = 1, pageSize = 10, startDate, endDate, minAmount, maxAmount, sortBy, sortOrder, platform } = params;
  
    let filteredContracts = mockContractsData.filter(contract => {
      const searchMatch = contract.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          String(contract.id).includes(searchTerm);
  
      const contractDate = new Date(contract.dateCreated);
      const startDateMatch = !startDate || contractDate >= new Date(startDate);
      const endDateMatch = !endDate || contractDate <= new Date(endDate);
  
      const amount = contract.amount || 0;
      const minAmountMatch = !minAmount || amount >= parseFloat(minAmount);
      const maxAmountMatch = !maxAmount || amount <= parseFloat(maxAmount);
  
      const platformMatch = !platform || platform === 'all' || contract.platform === platform;
  
      return searchMatch && startDateMatch && endDateMatch && minAmountMatch && maxAmountMatch && platformMatch;
    });
  
    if (sortBy) {
      filteredContracts.sort((a, b) => {
        const valA = a[sortBy];
        const valB = b[sortBy];
        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }
  
    const paginatedContracts = filteredContracts.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);
  
    return mockApiCall({
      items: paginatedContracts,
      totalCount: filteredContracts.length,
      pageSize,
    });
  }
  
  const getMyClientById = (clientId) => {
      const client = mockClientsData.find(c => c.id === parseInt(clientId));
      return mockApiCall(client);
    };
  
  const getClientContracts = (clientId) => {
    const contracts = mockContractsData.filter(c => c.clientId === parseInt(clientId));
    return mockApiCall(contracts);
  };
  
  const getContractDetails = (clientId, contractId) => {
      const contract = mockContractsData.find(c => c.id === parseInt(contractId) && c.clientId === parseInt(clientId));
      return mockApiCall(contract);
  };
  
  const getClientWithdraws = (clientId) => {
    const withdraws = mockWithdrawsData.filter(w => w.clientId === parseInt(clientId));
    return mockApiCall(withdraws);
  };
  
  const getDashboardData = () => {
      // 1. Gerar dinamicamente os melhores clientes
      const bestClients = [...mockClientsData] // Clona o array para não modificar o original
        .sort((a, b) => b.balance - a.balance); // Ordena por saldo decrescente
    
      // 2. Calcular as estatísticas das plataformas
      const totalClients = mockClientsData.length;
      const goldenClients = mockClientsData.filter(c => c.platform === 'Golden Brasil').length;
      const diamondClients = totalClients - goldenClients;
    
      const totalCommission = mockContractsData.reduce((acc, contract) => acc + (contract.commissionAmount || 0), 0);
      const goldenCommission = mockContractsData
        .filter(c => c.platform === 'Golden Brasil')
        .reduce((acc, contract) => acc + (contract.commissionAmount || 0), 0);
      const diamondCommission = totalCommission - goldenCommission;
    
      const platformStats = {
        clientDistribution: {
          golden: (goldenClients / totalClients) * 100,
          diamond: (diamondClients / totalClients) * 100,
        },
        commissionDistribution: {
          golden: (goldenCommission / totalCommission) * 100,
          diamond: (diamondCommission / totalCommission) * 100,
        },
        totalCommission: {
          golden: goldenCommission,
          diamond: diamondCommission,
        }
      };
    
      // 3. Montar o objeto final da dashboard
      const dashboardData = {
        ...mockDashboardData,
        bestClients, // Adiciona a lista dinâmica de melhores clientes
        platformStats // Adiciona as estatísticas calculadas
      };
    
      return mockApiCall(dashboardData);
    };
  
  const getMe = () => {
    const user = {
      id: 1,
      name: 'Consultor Golden',
      email: 'consultor@goldenbrasil.com',
      cpfCnpj: '000.000.000-00',
      commissionPercentage: 10,
      balance: 12345.67,
    };
    return mockApiCall(user);
  };
  
  const createWithdraw = (withdrawData) => {
    console.log('Creating withdraw with data:', withdrawData);
    return mockApiCall({ success: true, message: 'Saque solicitado com sucesso!' });
  };
  
  const sendWithdrawVerificationCode = () => {
    return mockApiCall({ success: true, message: 'Código de verificação enviado.' });
  };
  
  const getMyWithdraws = (params) => {
    return mockApiCall(mockConsultantWithdrawsData);
  };
  
  const getConsultantExtract = (params = {}) => {
    const { pageNumber = 1, pageSize = 10, startDate, endDate, minAmount, maxAmount, sortBy, sortOrder, type } = params;
    
    let filteredExtract = mockConsultantExtractData.items.filter(item => {
      const itemDate = new Date(item.date);
      const startDateMatch = !startDate || itemDate >= new Date(startDate);
      const endDateMatch = !endDate || itemDate <= new Date(endDate);
  
      const amount = item.amount || 0;
      const minAmountMatch = !minAmount || amount >= parseFloat(minAmount);
      const maxAmountMatch = !maxAmount || amount <= parseFloat(maxAmount);
  
      const typeMatch = !type || type === 'all' || item.type.toLowerCase() === type;
  
      return startDateMatch && endDateMatch && minAmountMatch && maxAmountMatch && typeMatch;
    });
  
    if (sortBy) {
      filteredExtract.sort((a, b) => {
        const valA = a[sortBy];
        const valB = b[sortBy];
        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }
  
    const paginatedExtract = filteredExtract.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);
  
    return mockApiCall({
      items: paginatedExtract,
      totalCount: filteredExtract.length,
      pageSize,
    });
  };
  
  const getIndicationDetails = (indicationId) => {
    const contract = mockContractsData.find(c => c.id === parseInt(indicationId));
    const indication = {
      ...contract,
      type: 'Comissão',
      description: `Comissão referente ao contrato #${contract.id} do cliente ${contract.clientName}`
    }
    return mockApiCall(indication);
  };
  
  const getWithdrawDetails = (withdrawId) => {
      const withdraw = mockConsultantWithdrawsData.items.find(w => w.id === parseInt(withdrawId));
      const details = {
        ...withdraw,
        type: 'Saque',
        description: `Saque de R$${withdraw.amountWithdrawn}`
      }
      return mockApiCall(details);
  };
  
  const consultantService = {
      searchMyClients,
      getMyClientById,
      getClientContracts,
      searchContracts,
      getContractDetails,
      getClientWithdraws,
      getDashboardData,
      getMe,
      createWithdraw,
      sendWithdrawVerificationCode,
      getMyWithdraws,
      getConsultantExtract,
      getIndicationDetails,
      getWithdrawDetails,
  };
  
  export default consultantService;