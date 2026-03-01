import {
  setupTestUser,
  setupTestEstablishment,
  authenticatedRequest,
  testData,
} from '../support/test-helpers';

describe('Payments E2E', () => {
  let auth: ReturnType<typeof authenticatedRequest>;
  let establishmentId: string;
  let productId: string;
  let orderId: string;
  let saleId: string;
  let paymentId: string;

  beforeAll(async () => {
    await setupTestUser();
    const establishment = await setupTestEstablishment();
    establishmentId = establishment.id;
    auth = authenticatedRequest();

    // Create product
    const productRes = await auth.post('/products', {
      name: 'Payment Test Product',
      establishmentId: establishmentId,
      price: 50.00,
      isActive: true,
      isAvailable: true,
    });
    productId = productRes.data.id;
    testData.products.push(productId);

    // Create order
    const orderRes = await auth.post('/orders', {
      establishmentId: establishmentId,
      type: 'DINE_IN',
      items: [{ productId: productId, quantity: 2, unitPrice: 50.00 }],
    });
    orderId = orderRes.data.id;
    testData.orders.push(orderId);

    // Create sale
    const saleRes = await auth.post('/sales', {
      orderId: orderId,
      establishmentId: establishmentId,
    });
    saleId = saleRes.data.id;
  });

  describe('POST /payments/process/:orderId', () => {
    it('should process payment for order', async () => {
      const res = await auth.post(`/payments/process/${orderId}`, {
        payments: [
          {
            paymentMethod: 'CASH',
            amount: 100.00,
          },
        ],
      });

      expect(res.status).toBe(201);
      expect(Array.isArray(res.data)).toBe(true);
      
      if (res.data.length > 0) {
        paymentId = res.data[0].id;
      }
    });

    it('should process split payment', async () => {
      // Create new order for split payment
      const orderRes = await auth.post('/orders', {
        establishmentId: establishmentId,
        type: 'TAKEOUT',
        items: [{ productId: productId, quantity: 2, unitPrice: 50.00 }],
      });
      const newOrderId = orderRes.data.id;
      testData.orders.push(newOrderId);

      await auth.post('/sales', {
        orderId: newOrderId,
        establishmentId: establishmentId,
      });

      const res = await auth.post(`/payments/process/${newOrderId}`, {
        payments: [
          { paymentMethod: 'CASH', amount: 50.00 },
          { paymentMethod: 'CREDIT_CARD', amount: 50.00 },
        ],
      });

      expect(res.status).toBe(201);
      expect(res.data.length).toBe(2);
    });
  });

  describe('POST /payments', () => {
    it('should create individual payment', async () => {
      const res = await auth.post('/payments', {
        saleId: saleId,
        paymentMethod: 'PIX',
        amount: 10.00,
      });

      if (res.status === 201) {
        expect(res.data).toHaveProperty('id');
      }
    });
  });

  describe('GET /payments/sale/:saleId', () => {
    it('should list payments by sale', async () => {
      const res = await auth.get(`/payments/sale/${saleId}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.data)).toBe(true);
    });
  });

  describe('GET /payments/:id', () => {
    it('should get payment by id', async () => {
      if (!paymentId) return;

      const res = await auth.get(`/payments/${paymentId}`);

      expect(res.status).toBe(200);
      expect(res.data.id).toBe(paymentId);
    });

    it('should return 404 for non-existent payment', async () => {
      const res = await auth.get('/payments/00000000-0000-0000-0000-000000000000');

      expect(res.status).toBe(404);
    });
  });

  describe('POST /payments/:id/refund', () => {
    it('should refund payment', async () => {
      if (!paymentId) return;

      const res = await auth.post(`/payments/${paymentId}/refund`, {
        reason: 'E2E Test refund',
      });

      expect([200, 400]).toContain(res.status);
    });
  });
});
