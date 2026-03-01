import axios from 'axios';
import {
  setupTestUser,
  setupTestEstablishment,
  authenticatedRequest,
  generateUniqueSku,
  testData,
} from '../support/test-helpers';

describe('Products E2E', () => {
  let auth: ReturnType<typeof authenticatedRequest>;
  let establishmentId: string;
  let categoryId: string;
  let productId: string;

  beforeAll(async () => {
    await setupTestUser();
    const establishment = await setupTestEstablishment();
    establishmentId = establishment.id;
    auth = authenticatedRequest();

    // Create a category for products
    const categoryRes = await auth.post('/categories', {
      name: 'Products Test Category',
      establishmentId: establishmentId,
      isActive: true,
    });
    categoryId = categoryRes.data.id;
    testData.categories.push(categoryId);
  });

  describe('POST /products', () => {
    it('should create a new product', async () => {
      const sku = generateUniqueSku();
      const res = await auth.post('/products', {
        name: 'E2E Test Product',
        description: 'A test product for E2E testing',
        establishmentId: establishmentId,
        categoryId: categoryId,
        price: 29.90,
        cost: 15.00,
        sku: sku,
        trackInventory: true,
        currentStock: 100,
        minStock: 10,
        maxStock: 200,
        unit: 'un',
        isActive: true,
        isAvailable: true,
      });

      expect(res.status).toBe(201);
      expect(res.data).toHaveProperty('id');
      expect(res.data.name).toBe('E2E Test Product');
      expect(res.data.sku).toBe(sku);

      productId = res.data.id;
      testData.products.push(productId);
    });

    it('should create product with minimum fields', async () => {
      const res = await auth.post('/products', {
        name: 'Minimal Product',
        establishmentId: establishmentId,
        price: 10.00,
      });

      expect(res.status).toBe(201);
      testData.products.push(res.data.id);
    });

    it('should fail to create product with duplicate SKU', async () => {
      const sku = generateUniqueSku();
      
      // First product
      await auth.post('/products', {
        name: 'First Product',
        establishmentId: establishmentId,
        price: 10.00,
        sku: sku,
      });

      // Duplicate SKU
      const res = await auth.post('/products', {
        name: 'Duplicate SKU Product',
        establishmentId: establishmentId,
        price: 10.00,
        sku: sku,
      });

      expect(res.status).toBe(409);
    });

    it('should fail to create product without establishment', async () => {
      const res = await auth.post('/products', {
        name: 'No Establishment Product',
        price: 10.00,
      });

      expect(res.status).toBe(400);
    });

    it('should fail to create product with invalid price', async () => {
      const res = await auth.post('/products', {
        name: 'Invalid Price Product',
        establishmentId: establishmentId,
        price: -10.00,
      });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /products', () => {
    it('should list products (public)', async () => {
      const res = await axios.get('/products');

      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty('data');
      expect(Array.isArray(res.data.data)).toBe(true);
    });

    it('should filter products by establishment', async () => {
      const res = await axios.get(`/products?establishmentId=${establishmentId}`);

      expect(res.status).toBe(200);
    });

    it('should filter products by category', async () => {
      const res = await axios.get(`/products?categoryId=${categoryId}`);

      expect(res.status).toBe(200);
    });

    it('should paginate products', async () => {
      const res = await axios.get('/products?page=1&limit=5');

      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty('page');
      expect(res.data).toHaveProperty('limit');
    });

    it('should search products by name', async () => {
      const res = await axios.get('/products?name=E2E');

      expect(res.status).toBe(200);
    });
  });

  describe('GET /products/featured/:establishmentId', () => {
    it('should list featured products', async () => {
      const res = await axios.get(`/products/featured/${establishmentId}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.data)).toBe(true);
    });
  });

  describe('GET /products/low-stock/:establishmentId', () => {
    it('should list low stock products', async () => {
      const res = await auth.get(`/products/low-stock/${establishmentId}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.data)).toBe(true);
    });
  });

  describe('GET /products/:id', () => {
    it('should get product by id (public)', async () => {
      const res = await axios.get(`/products/${productId}`);

      expect(res.status).toBe(200);
      expect(res.data.id).toBe(productId);
      expect(res.data).toHaveProperty('category');
    });

    it('should return 404 for non-existent product', async () => {
      const res = await axios.get('/products/00000000-0000-0000-0000-000000000000');

      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /products/:id', () => {
    it('should update product', async () => {
      const newName = 'Updated Product Name';
      const res = await auth.patch(`/products/${productId}`, {
        name: newName,
        price: 35.90,
      });

      expect(res.status).toBe(200);
      expect(res.data.name).toBe(newName);
    });
  });

  describe('PATCH /products/:id/stock', () => {
    it('should update product stock', async () => {
      const res = await auth.patch(`/products/${productId}/stock`, {
        operation: 'SET',
        quantity: 50,
      });

      expect(res.status).toBe(200);
    });

    it('should add to product stock', async () => {
      const res = await auth.patch(`/products/${productId}/stock`, {
        operation: 'ADD',
        quantity: 10,
      });

      expect(res.status).toBe(200);
    });

    it('should subtract from product stock', async () => {
      const res = await auth.patch(`/products/${productId}/stock`, {
        operation: 'SUBTRACT',
        quantity: 5,
      });

      expect(res.status).toBe(200);
    });
  });

  describe('PATCH /products/:id/toggle-availability', () => {
    it('should toggle product availability', async () => {
      const res = await auth.patch(`/products/${productId}/toggle-availability`);

      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty('isAvailable');
    });
  });

  describe('DELETE /products/:id', () => {
    it('should delete product', async () => {
      // Create a product to delete
      const createRes = await auth.post('/products', {
        name: 'Product to Delete',
        establishmentId: establishmentId,
        price: 10.00,
      });
      const deleteId = createRes.data.id;

      const res = await auth.delete(`/products/${deleteId}`);

      expect(res.status).toBe(204);
    });

    it('should return 404 when deleting non-existent product', async () => {
      const res = await auth.delete('/products/00000000-0000-0000-0000-000000000000');

      expect(res.status).toBe(404);
    });
  });
});
