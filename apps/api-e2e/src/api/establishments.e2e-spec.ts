import {
  setupTestUser,
  authenticatedRequest,
  generateUniqueEmail,
  generateUniquePhone,
  generateUniqueCnpj,
  testData,
} from '../support/test-helpers';

describe('Establishments E2E', () => {
  let auth: ReturnType<typeof authenticatedRequest>;
  let establishmentId: string;

  beforeAll(async () => {
    await setupTestUser();
    auth = authenticatedRequest();
  });

  describe('POST /establishments', () => {
    it('should create a new establishment', async () => {
      const res = await auth.post('/establishments', {
        name: `E2E Test Establishment ${Date.now()}`,
        tradeName: 'E2E Test',
        cnpj: generateUniqueCnpj(),
        email: generateUniqueEmail(),
        phone: generateUniquePhone(),
        street: 'Rua E2E Test',
        number: '100',
        complement: 'Sala 1',
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01310100',
      });

      expect(res.status).toBe(201);
      expect(res.data).toHaveProperty('id');
      expect(res.data).toHaveProperty('name');

      establishmentId = res.data.id;
      testData.establishments.push(establishmentId);
    });

    it('should fail to create establishment with duplicate CNPJ', async () => {
      const cnpj = generateUniqueCnpj();
      
      // First creation
      await auth.post('/establishments', {
        name: 'First Est',
        email: generateUniqueEmail(),
        phone: generateUniquePhone(),
        cnpj: cnpj,
        street: 'Rua Test',
        number: '1',
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01310100',
      });

      // Duplicate CNPJ
      const res = await auth.post('/establishments', {
        name: 'Second Est',
        email: generateUniqueEmail(),
        phone: generateUniquePhone(),
        cnpj: cnpj,
        street: 'Rua Test',
        number: '2',
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01310100',
      });

      expect(res.status).toBe(409);
    });

    it('should fail to create establishment without required fields', async () => {
      const res = await auth.post('/establishments', {
        name: 'Incomplete Est',
      });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /establishments', () => {
    it('should list establishments', async () => {
      const res = await auth.get('/establishments');

      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty('data');
      expect(Array.isArray(res.data.data)).toBe(true);
    });

    it('should filter establishments by name', async () => {
      const res = await auth.get('/establishments?name=E2E');

      expect(res.status).toBe(200);
    });

    it('should paginate establishments', async () => {
      const res = await auth.get('/establishments?page=1&limit=5');

      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty('page');
      expect(res.data).toHaveProperty('limit');
      expect(res.data).toHaveProperty('total');
    });
  });

  describe('GET /establishments/my', () => {
    it('should list user establishments', async () => {
      const res = await auth.get('/establishments/my');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.data)).toBe(true);
    });
  });

  describe('GET /establishments/:id', () => {
    it('should get establishment by id', async () => {
      const res = await auth.get(`/establishments/${establishmentId}`);

      expect(res.status).toBe(200);
      expect(res.data.id).toBe(establishmentId);
    });

    it('should return 404 for non-existent establishment', async () => {
      const res = await auth.get('/establishments/00000000-0000-0000-0000-000000000000');

      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /establishments/:id', () => {
    it('should update establishment', async () => {
      const newName = `Updated Establishment ${Date.now()}`;
      const res = await auth.patch(`/establishments/${establishmentId}`, {
        name: newName,
      });

      expect(res.status).toBe(200);
      expect(res.data.name).toBe(newName);
    });
  });

  describe('POST /establishments/:id/users', () => {
    it('should fail to add non-existent user to establishment', async () => {
      const res = await auth.post(`/establishments/${establishmentId}/users`, {
        userId: '00000000-0000-0000-0000-000000000000',
        role: 'CASHIER',
      });

      expect([400, 404]).toContain(res.status);
    });
  });
});
