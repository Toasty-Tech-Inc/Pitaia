/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';

// Armazena dados de teste criados para limpeza posterior
export const testData = {
  users: [] as string[],
  establishments: [] as string[],
  products: [] as string[],
  categories: [] as string[],
  customers: [] as string[],
  orders: [] as string[],
  tables: [] as string[],
  coupons: [] as string[],
};

// Tokens de autenticação
export let authToken = '';
export let refreshToken = '';
export let testUserId = '';
export let testEstablishmentId = '';

// Gerar dados únicos para testes
export const generateUniqueEmail = () => `test_${Date.now()}_${Math.random().toString(36).substring(7)}@test.com`;
export const generateUniquePhone = () => `119${Math.floor(10000000 + Math.random() * 90000000)}`;
export const generateUniqueCpf = () => {
  const digits = Array.from({ length: 11 }, () => Math.floor(Math.random() * 10)).join('');
  return digits;
};
export const generateUniqueSku = () => `SKU${Date.now()}${Math.random().toString(36).substring(7).toUpperCase()}`;
export const generateUniqueCnpj = () => {
  const digits = Array.from({ length: 14 }, () => Math.floor(Math.random() * 10)).join('');
  return digits;
};

// Helper para fazer requisições autenticadas
export const authenticatedRequest = () => {
  return {
    get: (url: string, config = {}) => 
      axios.get(url, { ...config, headers: { Authorization: `Bearer ${authToken}`, ...((config as any).headers || {}) } }),
    post: (url: string, data?: any, config = {}) =>
      axios.post(url, data, { ...config, headers: { Authorization: `Bearer ${authToken}`, ...((config as any).headers || {}) } }),
    patch: (url: string, data?: any, config = {}) =>
      axios.patch(url, data, { ...config, headers: { Authorization: `Bearer ${authToken}`, ...((config as any).headers || {}) } }),
    delete: (url: string, config = {}) =>
      axios.delete(url, { ...config, headers: { Authorization: `Bearer ${authToken}`, ...((config as any).headers || {}) } }),
  };
};

// Setup: criar usuário e autenticar
export const setupTestUser = async () => {
  const email = generateUniqueEmail();
  const password = 'TestPassword123!';
  const name = 'Test User E2E';
  const phone = generateUniquePhone();

  // Registrar usuário
  try {
    const registerRes = await axios.post('/auth/register', {
      email,
      password,
      name,
      phone,
    });

    if (registerRes.status === 201 || registerRes.status === 200) {
      authToken = registerRes.data.access_token || registerRes.data.accessToken;
      refreshToken = registerRes.data.refresh_token || registerRes.data.refreshToken;
      testUserId = registerRes.data.user?.id;
      if (testUserId) testData.users.push(testUserId);
      return registerRes.data;
    }

    // Se registro não retornou 2xx, logar o erro
    console.error('Register failed:', registerRes.status, registerRes.data);
  } catch (err) {
    console.error('Register error:', err);
  }

  // Se registro falhou, tentar login
  try {
    const loginRes = await axios.post('/auth/login', { email, password });
    if (loginRes.status === 200) {
      authToken = loginRes.data.access_token || loginRes.data.accessToken;
      refreshToken = loginRes.data.refresh_token || loginRes.data.refreshToken;
      testUserId = loginRes.data.user?.id;
      return loginRes.data;
    }
    console.error('Login failed:', loginRes.status, loginRes.data);
  } catch (err) {
    console.error('Login error:', err);
  }

  throw new Error('Failed to setup test user');
};

// Setup: criar estabelecimento de teste
export const setupTestEstablishment = async () => {
  const res = await authenticatedRequest().post('/establishments', {
    name: `Test Establishment ${Date.now()}`,
    tradeName: 'Test',
    cnpj: generateUniqueCnpj(),
    email: generateUniqueEmail(),
    phone: generateUniquePhone(),
    street: 'Rua Teste',
    number: '123',
    neighborhood: 'Centro',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '01000000',
  });

  if (res.status === 201 || res.status === 200) {
    testEstablishmentId = res.data.id;
    testData.establishments.push(res.data.id);
    return res.data;
  }

  throw new Error(`Failed to create test establishment: ${res.status} ${JSON.stringify(res.data)}`);
};

// Cleanup de dados de teste
export const cleanupTestData = async () => {
  const auth = authenticatedRequest();

  // Limpar na ordem correta de dependências
  for (const orderId of testData.orders) {
    try { await auth.delete(`/orders/${orderId}`); } catch { /* ignore */ }
  }
  for (const productId of testData.products) {
    try { await auth.delete(`/products/${productId}`); } catch { /* ignore */ }
  }
  for (const categoryId of testData.categories) {
    try { await auth.delete(`/categories/${categoryId}`); } catch { /* ignore */ }
  }
  for (const tableId of testData.tables) {
    try { await auth.delete(`/tables/${tableId}`); } catch { /* ignore */ }
  }
  for (const couponId of testData.coupons) {
    try { await auth.delete(`/coupons/${couponId}`); } catch { /* ignore */ }
  }
  for (const customerId of testData.customers) {
    try { await auth.delete(`/customers/${customerId}`); } catch { /* ignore */ }
  }
  for (const establishmentId of testData.establishments) {
    try { await auth.delete(`/establishments/${establishmentId}`); } catch { /* ignore */ }
  }
  for (const userId of testData.users) {
    try { await auth.delete(`/users/${userId}`); } catch { /* ignore */ }
  }

  // Reset test data
  Object.keys(testData).forEach(key => {
    (testData as Record<string, string[]>)[key] = [];
  });
};

// Set auth token
export const setAuthToken = (token: string) => {
  authToken = token;
};

export const setRefreshToken = (token: string) => {
  refreshToken = token;
};
