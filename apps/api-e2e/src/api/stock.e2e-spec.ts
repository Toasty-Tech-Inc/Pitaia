import {
  setupTestUser,
  setupTestEstablishment,
  authenticatedRequest,
  testData,
} from '../support/test-helpers';

describe('Stock E2E', () => {
  let auth: ReturnType<typeof authenticatedRequest>;
  let establishmentId: string;
  let productId: string;
  let movementId: string;

  beforeAll(async () => {
    await setupTestUser();
    const establishment = await setupTestEstablishment();
    establishmentId = establishment.id;
    auth = authenticatedRequest();

    // Create product with inventory tracking
    const productRes = await auth.post('/products', {
      name: 'Stock Test Product',
      establishmentId: establishmentId,
      price: 20.00,
      trackInventory: true,
      currentStock: 100,
      minStock: 10,
      maxStock: 200,
      isActive: true,
    });
    productId = productRes.data.id;
    testData.products.push(productId);
  });

  describe('POST /stock/movement', () => {
    it('should create stock entry movement', async () => {
      const res = await auth.post('/stock/movement', {
        productId: productId,
        type: 'ENTRY',
        quantity: 50,
        reason: 'E2E Test stock entry',
        unitCost: 10.00,
      });

      expect(res.status).toBe(201);
      expect(res.data).toHaveProperty('id');
      expect(res.data.type).toBe('ENTRY');

      movementId = res.data.id;
    });

    it('should create stock exit movement', async () => {
      const res = await auth.post('/stock/movement', {
        productId: productId,
        type: 'EXIT',
        quantity: 10,
        reason: 'E2E Test stock exit',
      });

      expect(res.status).toBe(201);
      expect(res.data.type).toBe('EXIT');
    });

    it('should create stock adjustment movement', async () => {
      const res = await auth.post('/stock/movement', {
        productId: productId,
        type: 'ADJUSTMENT',
        quantity: 5,
        reason: 'Inventory adjustment',
      });

      expect(res.status).toBe(201);
    });

    it('should fail exit when insufficient stock', async () => {
      const res = await auth.post('/stock/movement', {
        productId: productId,
        type: 'EXIT',
        quantity: 10000,
        reason: 'Should fail',
      });

      expect(res.status).toBe(400);
    });

    it('should fail for non-existent product', async () => {
      const res = await auth.post('/stock/movement', {
        productId: '00000000-0000-0000-0000-000000000000',
        type: 'ENTRY',
        quantity: 10,
      });

      expect(res.status).toBe(404);
    });
  });

  describe('GET /stock/movements', () => {
    it('should list stock movements', async () => {
      const res = await auth.get('/stock/movements');

      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty('data');
      expect(Array.isArray(res.data.data)).toBe(true);
    });

    it('should filter movements by product', async () => {
      const res = await auth.get(`/stock/movements?productId=${productId}`);

      expect(res.status).toBe(200);
    });

    it('should filter movements by type', async () => {
      const res = await auth.get('/stock/movements?type=ENTRY');

      expect(res.status).toBe(200);
    });
  });

  describe('GET /stock/movements/:id', () => {
    it('should get movement by id', async () => {
      const res = await auth.get(`/stock/movements/${movementId}`);

      expect(res.status).toBe(200);
      expect(res.data.id).toBe(movementId);
    });

    it('should return 404 for non-existent movement', async () => {
      const res = await auth.get('/stock/movements/00000000-0000-0000-0000-000000000000');

      expect(res.status).toBe(404);
    });
  });

  describe('GET /stock/product/:productId', () => {
    it('should get movements by product', async () => {
      const res = await auth.get(`/stock/product/${productId}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.data)).toBe(true);
    });
  });

  describe('POST /stock/product/:productId/adjust', () => {
    it('should adjust stock to specific quantity', async () => {
      const res = await auth.post(`/stock/product/${productId}/adjust`, {
        newQuantity: 80,
        reason: 'Inventory count adjustment',
      });

      expect(res.status).toBe(200);
    });
  });

  describe('GET /stock/report/:establishmentId', () => {
    it('should get stock report', async () => {
      const res = await auth.get(`/stock/report/${establishmentId}`);

      expect(res.status).toBe(200);
    });
  });
});
