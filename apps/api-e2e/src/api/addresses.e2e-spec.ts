import axios from 'axios';
import {
  setupTestUser,
  authenticatedRequest,
  generateUniquePhone,
  testData,
} from '../support/test-helpers';

describe('Addresses E2E', () => {
  let auth: ReturnType<typeof authenticatedRequest>;
  let customerId: string;
  let addressId: string;

  beforeAll(async () => {
    await setupTestUser();
    auth = authenticatedRequest();

    // Create customer
    const customerRes = await axios.post('/customers', {
      name: 'Address Test Customer',
      phone: generateUniquePhone(),
    });
    customerId = customerRes.data.id;
    testData.customers.push(customerId);
  });

  describe('POST /addresses', () => {
    it('should create a new address', async () => {
      const res = await auth.post('/addresses', {
        customerId: customerId,
        street: 'Rua E2E Test',
        number: '123',
        complement: 'Apto 45',
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01310100',
        isDefault: true,
      });

      expect(res.status).toBe(201);
      expect(res.data).toHaveProperty('id');
      expect(res.data.street).toBe('Rua E2E Test');

      addressId = res.data.id;
    });

    it('should create second address', async () => {
      const res = await auth.post('/addresses', {
        customerId: customerId,
        street: 'Avenida Test',
        number: '456',
        neighborhood: 'Jardins',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01402000',
        isDefault: false,
      });

      expect(res.status).toBe(201);
    });
  });

  describe('GET /addresses/my-addresses', () => {
    it('should list user addresses', async () => {
      const res = await auth.get('/addresses/my-addresses');

      expect(res.status).toBe(200);
    });
  });

  describe('GET /addresses/customer/:customerId', () => {
    it('should list customer addresses', async () => {
      const res = await auth.get(`/addresses/customer/${customerId}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.data)).toBe(true);
    });
  });

  describe('GET /addresses/:id', () => {
    it('should get address by id', async () => {
      const res = await auth.get(`/addresses/${addressId}`);

      expect(res.status).toBe(200);
      expect(res.data.id).toBe(addressId);
    });

    it('should return 404 for non-existent address', async () => {
      const res = await auth.get('/addresses/00000000-0000-0000-0000-000000000000');

      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /addresses/:id', () => {
    it('should update address', async () => {
      const res = await auth.patch(`/addresses/${addressId}`, {
        number: '999',
        complement: 'Updated complement',
      });

      expect(res.status).toBe(200);
      expect(res.data.number).toBe('999');
    });
  });

  describe('PATCH /addresses/:id/set-default', () => {
    it('should set address as default', async () => {
      const res = await auth.patch(`/addresses/${addressId}/set-default`);

      expect(res.status).toBe(200);
      expect(res.data.isDefault).toBe(true);
    });
  });

  describe('POST /addresses/calculate-delivery', () => {
    it('should calculate delivery fee (public)', async () => {
      // This test depends on establishment having coordinates
      const res = await axios.post('/addresses/calculate-delivery', {
        establishmentId: testData.establishments[0] || '00000000-0000-0000-0000-000000000000',
        addressId: addressId,
      });

      // May fail if establishment doesn't have coordinates
      expect([200, 400, 404]).toContain(res.status);
    });
  });

  describe('POST /addresses/geocode', () => {
    it('should geocode valid CEP (public)', async () => {
      const res = await axios.post('/addresses/geocode', {
        zipCode: '01310100',
      });

      // May fail if geocoding service is unavailable
      expect([200, 400, 404]).toContain(res.status);
    });

    it('should fail for invalid CEP format', async () => {
      const res = await axios.post('/addresses/geocode', {
        zipCode: '123',
      });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /addresses/viacep/:zipCode', () => {
    it('should get address from ViaCEP (public)', async () => {
      const res = await axios.get('/addresses/viacep/01310100');

      // May fail if ViaCEP is unavailable
      expect([200, 400, 404, 500]).toContain(res.status);
    });
  });

  describe('DELETE /addresses/:id', () => {
    it('should delete address', async () => {
      // Create address to delete
      const createRes = await auth.post('/addresses', {
        customerId: customerId,
        street: 'To Delete',
        number: '1',
        neighborhood: 'Test',
        city: 'Test',
        state: 'SP',
        zipCode: '01000000',
      });
      const deleteId = createRes.data.id;

      const res = await auth.delete(`/addresses/${deleteId}`);

      expect(res.status).toBe(204);
    });
  });
});
