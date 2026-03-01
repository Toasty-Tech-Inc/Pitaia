import axios from 'axios';
import {
  setupTestUser,
  setupTestEstablishment,
  authenticatedRequest,
  testData,
} from '../support/test-helpers';

describe('Product Modifiers E2E', () => {
  let auth: ReturnType<typeof authenticatedRequest>;
  let establishmentId: string;
  let productId: string;
  let modifierId: string;

  beforeAll(async () => {
    await setupTestUser();
    const establishment = await setupTestEstablishment();
    establishmentId = establishment.id;
    auth = authenticatedRequest();

    // Create product
    const productRes = await auth.post('/products', {
      name: 'Modifier Test Product',
      establishmentId: establishmentId,
      price: 35.00,
      isActive: true,
    });
    productId = productRes.data.id;
    testData.products.push(productId);
  });

  describe('POST /product-modifiers', () => {
    it('should create a product modifier', async () => {
      const res = await auth.post('/product-modifiers', {
        productId: productId,
        name: 'Size',
        isRequired: true,
        minSelections: 1,
        maxSelections: 1,
        sortOrder: 1,
      });

      expect(res.status).toBe(201);
      expect(res.data).toHaveProperty('id');
      expect(res.data.name).toBe('Size');

      modifierId = res.data.id;
    });

    it('should create optional modifier', async () => {
      const res = await auth.post('/product-modifiers', {
        productId: productId,
        name: 'Extras',
        isRequired: false,
        minSelections: 0,
        maxSelections: 5,
        sortOrder: 2,
      });

      expect(res.status).toBe(201);
      expect(res.data.isRequired).toBe(false);
    });

    it('should fail for non-existent product', async () => {
      const res = await auth.post('/product-modifiers', {
        productId: '00000000-0000-0000-0000-000000000000',
        name: 'Invalid',
      });

      expect(res.status).toBe(404);
    });
  });

  describe('POST /product-modifiers/bulk', () => {
    it('should create multiple modifiers with options', async () => {
      // Create another product for bulk test
      const productRes = await auth.post('/products', {
        name: 'Bulk Modifier Product',
        establishmentId: establishmentId,
        price: 40.00,
      });
      const bulkProductId = productRes.data.id;
      testData.products.push(bulkProductId);

      const res = await auth.post('/product-modifiers/bulk', {
        productId: bulkProductId,
        modifiers: [
          {
            name: 'Protein',
            isRequired: true,
            options: [
              { name: 'Chicken', price: 0 },
              { name: 'Beef', price: 5.00 },
            ],
          },
          {
            name: 'Toppings',
            isRequired: false,
            options: [
              { name: 'Cheese', price: 2.00 },
              { name: 'Bacon', price: 4.00 },
            ],
          },
        ],
      });

      expect(res.status).toBe(201);
      expect(Array.isArray(res.data)).toBe(true);
    });
  });

  describe('GET /product-modifiers/product/:productId', () => {
    it('should list modifiers by product (public)', async () => {
      const res = await axios.get(`/product-modifiers/product/${productId}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.data)).toBe(true);
    });
  });

  describe('GET /product-modifiers/:id', () => {
    it('should get modifier by id (public)', async () => {
      const res = await axios.get(`/product-modifiers/${modifierId}`);

      expect(res.status).toBe(200);
      expect(res.data.id).toBe(modifierId);
    });

    it('should return 404 for non-existent modifier', async () => {
      const res = await axios.get('/product-modifiers/00000000-0000-0000-0000-000000000000');

      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /product-modifiers/:id', () => {
    it('should update modifier', async () => {
      const res = await auth.patch(`/product-modifiers/${modifierId}`, {
        name: 'Updated Size',
        maxSelections: 2,
      });

      expect(res.status).toBe(200);
      expect(res.data.name).toBe('Updated Size');
    });
  });

  describe('PATCH /product-modifiers/:id/toggle-required', () => {
    it('should toggle required status', async () => {
      const res = await auth.patch(`/product-modifiers/${modifierId}/toggle-required`);

      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty('isRequired');
    });
  });

  describe('POST /product-modifiers/duplicate/:sourceProductId/:targetProductId', () => {
    it('should duplicate modifiers between products', async () => {
      // Create target product
      const targetRes = await auth.post('/products', {
        name: 'Target Product',
        establishmentId: establishmentId,
        price: 45.00,
      });
      const targetProductId = targetRes.data.id;
      testData.products.push(targetProductId);

      const res = await auth.post(
        `/product-modifiers/duplicate/${productId}/${targetProductId}`
      );

      expect(res.status).toBe(200);
    });
  });

  describe('DELETE /product-modifiers/:id', () => {
    it('should delete modifier', async () => {
      // Create modifier to delete
      const createRes = await auth.post('/product-modifiers', {
        productId: productId,
        name: 'To Delete',
      });
      const deleteId = createRes.data.id;

      const res = await auth.delete(`/product-modifiers/${deleteId}`);

      expect(res.status).toBe(204);
    });
  });
});
