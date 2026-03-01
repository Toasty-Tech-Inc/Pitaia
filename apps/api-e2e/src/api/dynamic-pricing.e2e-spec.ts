import {
  setupTestUser,
  setupTestEstablishment,
  authenticatedRequest,
  testData,
} from '../support/test-helpers';

describe('Dynamic Pricing E2E', () => {
  let auth: ReturnType<typeof authenticatedRequest>;
  let establishmentId: string;
  let productId: string;
  let dynamicPriceId: string;

  beforeAll(async () => {
    await setupTestUser();
    const establishment = await setupTestEstablishment();
    establishmentId = establishment.id;
    auth = authenticatedRequest();

    // Create product
    const productRes = await auth.post('/products', {
      name: 'Dynamic Price Product',
      establishmentId: establishmentId,
      price: 50.00,
      isActive: true,
    });
    productId = productRes.data.id;
    testData.products.push(productId);
  });

  describe('POST /dynamic-pricing', () => {
    it('should create percentage discount dynamic price', async () => {
      const res = await auth.post('/dynamic-pricing', {
        productId: productId,
        name: 'Happy Hour',
        priceType: 'PERCENTAGE_DISCOUNT',
        value: 20,
        startTime: '17:00',
        endTime: '19:00',
        daysOfWeek: [1, 2, 3, 4, 5],
        isActive: true,
      });

      expect(res.status).toBe(201);
      expect(res.data).toHaveProperty('id');
      expect(res.data.priceType).toBe('PERCENTAGE_DISCOUNT');

      dynamicPriceId = res.data.id;
    });

    it('should create fixed price dynamic price', async () => {
      const res = await auth.post('/dynamic-pricing', {
        productId: productId,
        name: 'Weekend Special',
        priceType: 'FIXED_PRICE',
        value: 40.00,
        daysOfWeek: [0, 6],
        isActive: true,
      });

      expect(res.status).toBe(201);
      expect(res.data.priceType).toBe('FIXED_PRICE');
    });

    it('should create fixed discount dynamic price', async () => {
      const res = await auth.post('/dynamic-pricing', {
        productId: productId,
        name: 'Lunch Discount',
        priceType: 'FIXED_DISCOUNT',
        value: 5.00,
        startTime: '11:00',
        endTime: '14:00',
        isActive: true,
      });

      expect(res.status).toBe(201);
    });

    it('should fail for non-existent product', async () => {
      const res = await auth.post('/dynamic-pricing', {
        productId: '00000000-0000-0000-0000-000000000000',
        name: 'Invalid',
        priceType: 'FIXED_PRICE',
        value: 30.00,
      });

      expect(res.status).toBe(404);
    });
  });

  describe('GET /dynamic-pricing', () => {
    it('should list dynamic prices', async () => {
      const res = await auth.get('/dynamic-pricing');

      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty('data');
      expect(Array.isArray(res.data.data)).toBe(true);
    });

    it('should filter by product', async () => {
      const res = await auth.get(`/dynamic-pricing?productId=${productId}`);

      expect(res.status).toBe(200);
    });

    it('should filter by active status', async () => {
      const res = await auth.get('/dynamic-pricing?isActive=true');

      expect(res.status).toBe(200);
    });
  });

  describe('GET /dynamic-pricing/:id', () => {
    it('should get dynamic price by id', async () => {
      const res = await auth.get(`/dynamic-pricing/${dynamicPriceId}`);

      expect(res.status).toBe(200);
      expect(res.data.id).toBe(dynamicPriceId);
    });

    it('should return 404 for non-existent dynamic price', async () => {
      const res = await auth.get('/dynamic-pricing/00000000-0000-0000-0000-000000000000');

      expect(res.status).toBe(404);
    });
  });

  describe('GET /dynamic-pricing/product/:productId', () => {
    it('should list dynamic prices by product', async () => {
      const res = await auth.get(`/dynamic-pricing/product/${productId}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.data)).toBe(true);
    });
  });

  describe('GET /dynamic-pricing/product/:productId/current', () => {
    it('should get current price for product', async () => {
      const res = await auth.get(`/dynamic-pricing/product/${productId}/current`);

      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty('price');
    });
  });

  describe('GET /dynamic-pricing/product/:productId/analysis', () => {
    it('should get pricing analysis', async () => {
      const res = await auth.get(`/dynamic-pricing/product/${productId}/analysis`);

      expect(res.status).toBe(200);
    });
  });

  describe('PATCH /dynamic-pricing/:id', () => {
    it('should update dynamic price', async () => {
      const res = await auth.patch(`/dynamic-pricing/${dynamicPriceId}`, {
        name: 'Updated Happy Hour',
        value: 25,
      });

      expect(res.status).toBe(200);
      expect(res.data.name).toBe('Updated Happy Hour');
    });
  });

  describe('PATCH /dynamic-pricing/:id/toggle', () => {
    it('should toggle dynamic price active status', async () => {
      const res = await auth.patch(`/dynamic-pricing/${dynamicPriceId}/toggle`);

      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty('isActive');
    });
  });

  describe('DELETE /dynamic-pricing/:id', () => {
    it('should delete dynamic price', async () => {
      // Create dynamic price to delete
      const createRes = await auth.post('/dynamic-pricing', {
        productId: productId,
        name: 'To Delete',
        priceType: 'FIXED_PRICE',
        value: 30.00,
      });
      const deleteId = createRes.data.id;

      const res = await auth.delete(`/dynamic-pricing/${deleteId}`);

      expect(res.status).toBe(204);
    });
  });
});
