import {
  setupTestUser,
  setupTestEstablishment,
  authenticatedRequest,
  testData,
} from '../support/test-helpers';

describe('Sales E2E', () => {
  let auth: ReturnType<typeof authenticatedRequest>;
  let establishmentId: string;
  let productId: string;
  let orderId: string;
  let saleId: string;

  beforeAll(async () => {
    await setupTestUser();
    const establishment = await setupTestEstablishment();
    establishmentId = establishment.id;
    auth = authenticatedRequest();

    // Create product
    const productRes = await auth.post('/products', {
      name: 'Sale Test Product',
      establishmentId: establishmentId,
      price: 30.00,
      isActive: true,
      isAvailable: true,
    });
    productId = productRes.data.id;
    testData.products.push(productId);

    // Create order
    const orderRes = await auth.post('/orders', {
      establishmentId: establishmentId,
      type: 'DINE_IN',
      items: [{ productId: productId, quantity: 2, unitPrice: 30.00 }],
    });
    orderId = orderRes.data.id;
    testData.orders.push(orderId);
  });

  describe('POST /sales', () => {
    it('should create a sale from order', async () => {
      const res = await auth.post('/sales', {
        orderId: orderId,
        establishmentId: establishmentId,
      });

      expect(res.status).toBe(201);
      expect(res.data).toHaveProperty('id');
      expect(res.data.orderId).toBe(orderId);

      saleId = res.data.id;
    });

    it('should fail to create duplicate sale for same order', async () => {
      const res = await auth.post('/sales', {
        orderId: orderId,
        establishmentId: establishmentId,
      });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /sales', () => {
    it('should list sales with pagination', async () => {
      const res = await auth.get('/sales');

      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty('data');
      expect(Array.isArray(res.data.data)).toBe(true);
    });

    it('should filter sales by establishment', async () => {
      const res = await auth.get(`/sales?establishmentId=${establishmentId}`);

      expect(res.status).toBe(200);
    });

    it('should filter sales by date range', async () => {
      const today = new Date().toISOString().split('T')[0];
      const res = await auth.get(`/sales?startDate=${today}&endDate=${today}`);

      expect(res.status).toBe(200);
    });
  });

  describe('GET /sales/report', () => {
    it('should generate sales report', async () => {
      const res = await auth.get('/sales/report?type=DAILY');

      expect(res.status).toBe(200);
    });
  });

  describe('GET /sales/establishment/:establishmentId', () => {
    it('should get sales by establishment', async () => {
      const res = await auth.get(`/sales/establishment/${establishmentId}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.data)).toBe(true);
    });
  });

  describe('GET /sales/report/daily/:establishmentId', () => {
    it('should get daily sales report', async () => {
      const res = await auth.get(`/sales/report/daily/${establishmentId}`);

      expect(res.status).toBe(200);
    });

    it('should get daily report for specific date', async () => {
      const today = new Date().toISOString().split('T')[0];
      const res = await auth.get(`/sales/report/daily/${establishmentId}?date=${today}`);

      expect(res.status).toBe(200);
    });
  });

  describe('GET /sales/report/products/:establishmentId', () => {
    it('should get product sales report', async () => {
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const endDate = new Date().toISOString();
      
      const res = await auth.get(
        `/sales/report/products/${establishmentId}?startDate=${startDate}&endDate=${endDate}`
      );

      expect(res.status).toBe(200);
    });
  });

  describe('GET /sales/:id', () => {
    it('should get sale by id', async () => {
      const res = await auth.get(`/sales/${saleId}`);

      expect(res.status).toBe(200);
      expect(res.data.id).toBe(saleId);
    });

    it('should return 404 for non-existent sale', async () => {
      const res = await auth.get('/sales/00000000-0000-0000-0000-000000000000');

      expect(res.status).toBe(404);
    });
  });
});
