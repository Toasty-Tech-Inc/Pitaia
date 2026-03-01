import {
  setupTestUser,
  setupTestEstablishment,
  authenticatedRequest,
  testData,
} from '../support/test-helpers';

describe('Orders E2E', () => {
  let auth: ReturnType<typeof authenticatedRequest>;
  let establishmentId: string;
  let productId: string;
  let orderId: string;

  beforeAll(async () => {
    await setupTestUser();
    const establishment = await setupTestEstablishment();
    establishmentId = establishment.id;
    auth = authenticatedRequest();

    // Create a product for orders
    const productRes = await auth.post('/products', {
      name: 'Order Test Product',
      establishmentId: establishmentId,
      price: 25.90,
      isActive: true,
      isAvailable: true,
    });
    productId = productRes.data.id;
    testData.products.push(productId);
  });

  describe('POST /orders', () => {
    it('should create a new order', async () => {
      const res = await auth.post('/orders', {
        establishmentId: establishmentId,
        type: 'DINE_IN',
        source: 'POS',
        items: [
          {
            productId: productId,
            quantity: 2,
            unitPrice: 25.90,
            notes: 'Sem cebola',
          },
        ],
        notes: 'E2E Test Order',
      });

      expect(res.status).toBe(201);
      expect(res.data).toHaveProperty('id');
      expect(res.data).toHaveProperty('orderNumber');
      expect(res.data.status).toBe('PENDING');

      orderId = res.data.id;
      testData.orders.push(orderId);
    });

    it('should create order with multiple items', async () => {
      const res = await auth.post('/orders', {
        establishmentId: establishmentId,
        type: 'TAKEOUT',
        items: [
          {
            productId: productId,
            quantity: 1,
            unitPrice: 25.90,
          },
          {
            productId: productId,
            quantity: 3,
            unitPrice: 25.90,
          },
        ],
      });

      expect(res.status).toBe(201);
      testData.orders.push(res.data.id);
    });

    it('should fail to create order without items', async () => {
      const res = await auth.post('/orders', {
        establishmentId: establishmentId,
        type: 'DINE_IN',
        items: [],
      });

      expect(res.status).toBe(400);
    });

    it('should fail to create order without establishment', async () => {
      const res = await auth.post('/orders', {
        type: 'DINE_IN',
        items: [
          {
            productId: productId,
            quantity: 1,
            unitPrice: 25.90,
          },
        ],
      });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /orders', () => {
    it('should list orders with pagination', async () => {
      const res = await auth.get('/orders');

      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty('data');
      expect(Array.isArray(res.data.data)).toBe(true);
    });

    it('should filter orders by establishment', async () => {
      const res = await auth.get(`/orders?establishmentId=${establishmentId}`);

      expect(res.status).toBe(200);
    });

    it('should filter orders by status', async () => {
      const res = await auth.get('/orders?status=PENDING');

      expect(res.status).toBe(200);
    });

    it('should paginate orders', async () => {
      const res = await auth.get('/orders?page=1&limit=5');

      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty('page');
      expect(res.data).toHaveProperty('limit');
    });
  });

  describe('GET /orders/status/:establishmentId/:status', () => {
    it('should list orders by status', async () => {
      const res = await auth.get(`/orders/status/${establishmentId}/PENDING`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.data)).toBe(true);
    });
  });

  describe('GET /orders/my-orders', () => {
    it('should list user orders', async () => {
      const res = await auth.get('/orders/my-orders');

      expect(res.status).toBe(200);
    });
  });

  describe('GET /orders/:id', () => {
    it('should get order by id', async () => {
      const res = await auth.get(`/orders/${orderId}`);

      expect(res.status).toBe(200);
      expect(res.data.id).toBe(orderId);
      expect(res.data).toHaveProperty('items');
    });

    it('should return 404 for non-existent order', async () => {
      const res = await auth.get('/orders/00000000-0000-0000-0000-000000000000');

      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /orders/:id', () => {
    it('should update order', async () => {
      const res = await auth.patch(`/orders/${orderId}`, {
        notes: 'Updated order notes',
      });

      expect(res.status).toBe(200);
    });
  });

  describe('PATCH /orders/:id/status', () => {
    it('should update order status', async () => {
      const res = await auth.patch(`/orders/${orderId}/status`, {
        status: 'CONFIRMED',
        notes: 'Order confirmed',
      });

      expect(res.status).toBe(200);
      expect(res.data.status).toBe('CONFIRMED');
    });
  });

  describe('POST /orders/:id/confirm', () => {
    it('should confirm order', async () => {
      // Create new order to confirm
      const createRes = await auth.post('/orders', {
        establishmentId: establishmentId,
        type: 'DINE_IN',
        items: [{ productId: productId, quantity: 1, unitPrice: 25.90 }],
      });
      const newOrderId = createRes.data.id;
      testData.orders.push(newOrderId);

      const res = await auth.post(`/orders/${newOrderId}/confirm`);

      expect(res.status).toBe(200);
      expect(res.data.status).toBe('CONFIRMED');
    });
  });

  describe('POST /orders/:id/prepare', () => {
    it('should start preparing order', async () => {
      const res = await auth.post(`/orders/${orderId}/prepare`);

      expect(res.status).toBe(200);
      expect(res.data.status).toBe('PREPARING');
    });
  });

  describe('POST /orders/:id/ready', () => {
    it('should mark order as ready', async () => {
      const res = await auth.post(`/orders/${orderId}/ready`);

      expect(res.status).toBe(200);
      expect(res.data.status).toBe('READY');
    });
  });

  describe('POST /orders/:id/complete', () => {
    it('should complete order', async () => {
      const res = await auth.post(`/orders/${orderId}/complete`);

      expect(res.status).toBe(200);
      expect(res.data.status).toBe('COMPLETED');
    });
  });

  describe('POST /orders/:id/cancel', () => {
    it('should cancel pending order', async () => {
      // Create new order to cancel
      const createRes = await auth.post('/orders', {
        establishmentId: establishmentId,
        type: 'DINE_IN',
        items: [{ productId: productId, quantity: 1, unitPrice: 25.90 }],
      });
      const cancelOrderId = createRes.data.id;
      testData.orders.push(cancelOrderId);

      const res = await auth.post(`/orders/${cancelOrderId}/cancel`, {
        reason: 'Customer request',
      });

      expect(res.status).toBe(200);
      expect(res.data.status).toBe('CANCELLED');
    });

    it('should fail to cancel completed order', async () => {
      const res = await auth.post(`/orders/${orderId}/cancel`, {
        reason: 'Should fail',
      });

      expect(res.status).toBe(400);
    });
  });
});
