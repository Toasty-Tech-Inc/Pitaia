import axios from 'axios';
import {
  setupTestUser,
  setupTestEstablishment,
  authenticatedRequest,
  testData,
} from '../support/test-helpers';

describe('Coupons E2E', () => {
  let auth: ReturnType<typeof authenticatedRequest>;
  let establishmentId: string;
  let couponId: string;
  const couponCode = `COUPON_${Date.now()}`;

  beforeAll(async () => {
    await setupTestUser();
    const establishment = await setupTestEstablishment();
    establishmentId = establishment.id;
    auth = authenticatedRequest();
  });

  describe('POST /coupons', () => {
    it('should create a new percentage coupon', async () => {
      const res = await auth.post('/coupons', {
        code: couponCode,
        establishmentId: establishmentId,
        discountType: 'PERCENTAGE',
        discountValue: 10,
        minOrderAmount: 50.00,
        maxUses: 100,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        isActive: true,
        isPublic: true,
      });

      expect(res.status).toBe(201);
      expect(res.data).toHaveProperty('id');
      expect(res.data.code).toBe(couponCode);
      expect(res.data.discountType).toBe('PERCENTAGE');

      couponId = res.data.id;
      testData.coupons.push(couponId);
    });

    it('should create a fixed amount coupon', async () => {
      const fixedCode = `FIXED_${Date.now()}`;
      const res = await auth.post('/coupons', {
        code: fixedCode,
        establishmentId: establishmentId,
        discountType: 'FIXED',
        discountValue: 15.00,
        isActive: true,
      });

      expect(res.status).toBe(201);
      expect(res.data.discountType).toBe('FIXED');
      testData.coupons.push(res.data.id);
    });

    it('should fail to create coupon with duplicate code', async () => {
      const res = await auth.post('/coupons', {
        code: couponCode,
        establishmentId: establishmentId,
        discountType: 'PERCENTAGE',
        discountValue: 5,
      });

      expect(res.status).toBe(409);
    });

    it('should fail to create coupon without code', async () => {
      const res = await auth.post('/coupons', {
        establishmentId: establishmentId,
        discountType: 'PERCENTAGE',
        discountValue: 5,
      });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /coupons', () => {
    it('should list coupons (public)', async () => {
      const res = await axios.get('/coupons');

      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty('data');
      expect(Array.isArray(res.data.data)).toBe(true);
    });

    it('should filter coupons by establishment', async () => {
      const res = await axios.get(`/coupons?establishmentId=${establishmentId}`);

      expect(res.status).toBe(200);
    });
  });

  describe('GET /coupons/public', () => {
    it('should list public coupons', async () => {
      const res = await axios.get('/coupons/public');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.data)).toBe(true);
    });
  });

  describe('POST /coupons/validate', () => {
    it('should validate valid coupon', async () => {
      const res = await axios.post('/coupons/validate', {
        code: couponCode,
        establishmentId: establishmentId,
        orderAmount: 100.00,
      });

      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty('valid');
    });

    it('should fail to validate non-existent coupon', async () => {
      const res = await axios.post('/coupons/validate', {
        code: 'NONEXISTENT',
        establishmentId: establishmentId,
        orderAmount: 100.00,
      });

      expect(res.status).toBe(404);
    });

    it('should fail validation for order below minimum', async () => {
      const res = await axios.post('/coupons/validate', {
        code: couponCode,
        establishmentId: establishmentId,
        orderAmount: 10.00,
      });

      // Should return 400 or indicate invalid
      expect([200, 400]).toContain(res.status);
      if (res.status === 200) {
        expect(res.data.valid).toBe(false);
      }
    });
  });

  describe('GET /coupons/code/:code', () => {
    it('should find coupon by code', async () => {
      const res = await axios.get(`/coupons/code/${couponCode}`);

      expect(res.status).toBe(200);
      expect(res.data.code).toBe(couponCode);
    });

    it('should return 404 for non-existent code', async () => {
      const res = await axios.get('/coupons/code/NONEXISTENT');

      expect(res.status).toBe(404);
    });
  });

  describe('GET /coupons/:id', () => {
    it('should get coupon by id', async () => {
      const res = await axios.get(`/coupons/${couponId}`);

      expect(res.status).toBe(200);
      expect(res.data.id).toBe(couponId);
    });

    it('should return 404 for non-existent coupon', async () => {
      const res = await axios.get('/coupons/00000000-0000-0000-0000-000000000000');

      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /coupons/:id', () => {
    it('should update coupon', async () => {
      const res = await auth.patch(`/coupons/${couponId}`, {
        discountValue: 15,
        maxUses: 200,
      });

      expect(res.status).toBe(200);
      expect(res.data.discountValue).toBe(15);
    });
  });

  describe('PATCH /coupons/:id/toggle-active', () => {
    it('should toggle coupon active status', async () => {
      const res = await auth.patch(`/coupons/${couponId}/toggle-active`);

      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty('isActive');
    });
  });

  describe('DELETE /coupons/:id', () => {
    it('should delete coupon', async () => {
      // Create coupon to delete
      const createRes = await auth.post('/coupons', {
        code: `DEL_${Date.now()}`,
        establishmentId: establishmentId,
        discountType: 'PERCENTAGE',
        discountValue: 5,
      });
      const deleteId = createRes.data.id;

      const res = await auth.delete(`/coupons/${deleteId}`);

      expect(res.status).toBe(204);
    });
  });
});
