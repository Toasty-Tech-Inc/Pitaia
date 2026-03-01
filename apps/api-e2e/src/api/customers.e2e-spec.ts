import axios from 'axios';
import {
  setupTestUser,
  authenticatedRequest,
  generateUniquePhone,
  generateUniqueCpf,
  generateUniqueEmail,
  testData,
} from '../support/test-helpers';

describe('Customers E2E', () => {
  let auth: ReturnType<typeof authenticatedRequest>;
  let customerId: string;
  const testPhone = generateUniquePhone();
  const testCpf = generateUniqueCpf();

  beforeAll(async () => {
    await setupTestUser();
    auth = authenticatedRequest();
  });

  describe('POST /customers', () => {
    it('should create a new customer (public)', async () => {
      const res = await axios.post('/customers', {
        name: 'E2E Test Customer',
        phone: testPhone,
        email: generateUniqueEmail(),
        cpf: testCpf,
        birthDate: '1990-01-15',
        isActive: true,
      });

      expect(res.status).toBe(201);
      expect(res.data).toHaveProperty('id');
      expect(res.data.name).toBe('E2E Test Customer');
      expect(res.data.phone).toBe(testPhone);

      customerId = res.data.id;
      testData.customers.push(customerId);
    });

    it('should create customer with minimum fields', async () => {
      const res = await axios.post('/customers', {
        name: 'Minimal Customer',
        phone: generateUniquePhone(),
      });

      expect(res.status).toBe(201);
      testData.customers.push(res.data.id);
    });

    it('should create customer with address', async () => {
      const res = await axios.post('/customers', {
        name: 'Customer with Address',
        phone: generateUniquePhone(),
        address: {
          street: 'Rua Test',
          number: '123',
          complement: 'Apto 1',
          neighborhood: 'Centro',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01310100',
        },
      });

      expect(res.status).toBe(201);
      testData.customers.push(res.data.id);
    });

    it('should fail to create customer with duplicate phone', async () => {
      const res = await axios.post('/customers', {
        name: 'Duplicate Phone Customer',
        phone: testPhone,
      });

      expect(res.status).toBe(409);
    });

    it('should fail to create customer with duplicate CPF', async () => {
      const res = await axios.post('/customers', {
        name: 'Duplicate CPF Customer',
        phone: generateUniquePhone(),
        cpf: testCpf,
      });

      expect(res.status).toBe(409);
    });

    it('should fail to create customer with invalid phone', async () => {
      const res = await axios.post('/customers', {
        name: 'Invalid Phone Customer',
        phone: '123',
      });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /customers', () => {
    it('should list customers with pagination', async () => {
      const res = await auth.get('/customers');

      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty('data');
      expect(Array.isArray(res.data.data)).toBe(true);
    });

    it('should filter customers by name', async () => {
      const res = await auth.get('/customers?name=E2E');

      expect(res.status).toBe(200);
    });

    it('should paginate customers', async () => {
      const res = await auth.get('/customers?page=1&limit=5');

      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty('page');
      expect(res.data).toHaveProperty('limit');
    });
  });

  describe('GET /customers/phone/:phone', () => {
    it('should find customer by phone', async () => {
      const res = await auth.get(`/customers/phone/${testPhone}`);

      expect(res.status).toBe(200);
      expect(res.data.phone).toBe(testPhone);
    });

    it('should return 404 for non-existent phone', async () => {
      const res = await auth.get('/customers/phone/11999999999');

      expect(res.status).toBe(404);
    });
  });

  describe('GET /customers/cpf/:cpf', () => {
    it('should find customer by CPF', async () => {
      const res = await auth.get(`/customers/cpf/${testCpf}`);

      expect(res.status).toBe(200);
      expect(res.data.cpf).toBe(testCpf);
    });

    it('should return 404 for non-existent CPF', async () => {
      const res = await auth.get('/customers/cpf/00000000000');

      expect(res.status).toBe(404);
    });
  });

  describe('GET /customers/:id', () => {
    it('should get customer by id', async () => {
      const res = await auth.get(`/customers/${customerId}`);

      expect(res.status).toBe(200);
      expect(res.data.id).toBe(customerId);
    });

    it('should return 404 for non-existent customer', async () => {
      const res = await auth.get('/customers/00000000-0000-0000-0000-000000000000');

      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /customers/:id', () => {
    it('should update customer', async () => {
      const newName = 'Updated Customer Name';
      const res = await auth.patch(`/customers/${customerId}`, {
        name: newName,
      });

      expect(res.status).toBe(200);
      expect(res.data.name).toBe(newName);
    });
  });

  describe('PATCH /customers/:id/toggle-active', () => {
    it('should toggle customer active status', async () => {
      const res = await auth.patch(`/customers/${customerId}/toggle-active`);

      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty('isActive');
    });
  });

  describe('POST /customers/:id/addresses', () => {
    it('should add address to customer', async () => {
      const res = await auth.post(`/customers/${customerId}/addresses`, {
        street: 'Nova Rua',
        number: '456',
        neighborhood: 'Bairro Novo',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01310200',
        isDefault: true,
      });

      expect(res.status).toBe(201);
    });
  });

  describe('DELETE /customers/:id', () => {
    it('should delete customer', async () => {
      // Create customer to delete
      const createRes = await axios.post('/customers', {
        name: 'Customer to Delete',
        phone: generateUniquePhone(),
      });
      const deleteId = createRes.data.id;

      const res = await auth.delete(`/customers/${deleteId}`);

      expect(res.status).toBe(204);
    });

    it('should return 404 when deleting non-existent customer', async () => {
      const res = await auth.delete('/customers/00000000-0000-0000-0000-000000000000');

      expect(res.status).toBe(404);
    });
  });
});
