import axios from 'axios';
import {
  setupTestUser,
  authenticatedRequest,
  generateUniquePhone,
  testData,
} from '../support/test-helpers';

describe('Loyalty E2E', () => {
  let auth: ReturnType<typeof authenticatedRequest>;
  let customerId: string;

  beforeAll(async () => {
    await setupTestUser();
    auth = authenticatedRequest();

    // Create customer for loyalty tests
    const customerRes = await axios.post('/customers', {
      name: 'Loyalty Test Customer',
      phone: generateUniquePhone(),
    });
    customerId = customerRes.data.id;
    testData.customers.push(customerId);
  });

  describe('POST /loyalty/earn', () => {
    it('should add loyalty points', async () => {
      const res = await auth.post('/loyalty/earn', {
        customerId: customerId,
        points: 100,
        description: 'E2E Test points',
        saleAmount: 200.00,
      });

      expect(res.status).toBe(201);
      expect(res.data).toHaveProperty('id');
      expect(res.data.type).toBe('EARN');
    });

    it('should fail to add points for non-existent customer', async () => {
      const res = await auth.post('/loyalty/earn', {
        customerId: '00000000-0000-0000-0000-000000000000',
        points: 50,
      });

      expect(res.status).toBe(404);
    });
  });

  describe('GET /loyalty/balance/:customerId', () => {
    it('should get customer points balance', async () => {
      const res = await auth.get(`/loyalty/balance/${customerId}`);

      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty('balance');
      expect(res.data.balance).toBeGreaterThanOrEqual(100);
    });

    it('should return 404 for non-existent customer', async () => {
      const res = await auth.get('/loyalty/balance/00000000-0000-0000-0000-000000000000');

      expect(res.status).toBe(404);
    });
  });

  describe('POST /loyalty/redeem/:customerId', () => {
    it('should redeem points', async () => {
      const res = await auth.post(`/loyalty/redeem/${customerId}`, {
        points: 50,
        description: 'E2E Test redemption',
      });

      expect(res.status).toBe(201);
      expect(res.data).toHaveProperty('id');
      expect(res.data.type).toBe('REDEEM');
    });

    it('should fail to redeem more points than balance', async () => {
      const res = await auth.post(`/loyalty/redeem/${customerId}`, {
        points: 100000,
        description: 'Should fail',
      });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /loyalty/adjust', () => {
    it('should adjust points manually', async () => {
      const res = await auth.post('/loyalty/adjust', {
        customerId: customerId,
        points: 25,
        type: 'ADJUSTMENT',
        description: 'Manual adjustment',
      });

      expect(res.status).toBe(201);
    });
  });

  describe('GET /loyalty/transactions', () => {
    it('should list loyalty transactions', async () => {
      const res = await auth.get('/loyalty/transactions');

      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty('data');
      expect(Array.isArray(res.data.data)).toBe(true);
    });

    it('should filter transactions by customer', async () => {
      const res = await auth.get(`/loyalty/transactions?customerId=${customerId}`);

      expect(res.status).toBe(200);
    });
  });

  describe('GET /loyalty/customer/:customerId', () => {
    it('should get customer transactions', async () => {
      const res = await auth.get(`/loyalty/customer/${customerId}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.data)).toBe(true);
    });
  });

  describe('GET /loyalty/summary/:customerId', () => {
    it('should get customer loyalty summary', async () => {
      const res = await auth.get(`/loyalty/summary/${customerId}`);

      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty('totalEarned');
      expect(res.data).toHaveProperty('totalRedeemed');
      expect(res.data).toHaveProperty('currentBalance');
    });
  });

  describe('POST /loyalty/process-expired', () => {
    it('should process expired points', async () => {
      const res = await auth.post('/loyalty/process-expired');

      expect(res.status).toBe(200);
    });
  });
});
