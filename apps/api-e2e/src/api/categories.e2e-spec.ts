import axios from 'axios';
import {
  setupTestUser,
  setupTestEstablishment,
  authenticatedRequest,
  testData,
} from '../support/test-helpers';

describe('Categories E2E', () => {
  let auth: ReturnType<typeof authenticatedRequest>;
  let establishmentId: string;
  let categoryId: string;
  let parentCategoryId: string;

  beforeAll(async () => {
    await setupTestUser();
    const establishment = await setupTestEstablishment();
    establishmentId = establishment.id;
    auth = authenticatedRequest();
  });

  describe('POST /categories', () => {
    it('should create a new category', async () => {
      const res = await auth.post('/categories', {
        name: 'E2E Test Category',
        establishmentId: establishmentId,
        description: 'Test category description',
        sortOrder: 1,
        isActive: true,
      });

      expect(res.status).toBe(201);
      expect(res.data).toHaveProperty('id');
      expect(res.data.name).toBe('E2E Test Category');

      categoryId = res.data.id;
      parentCategoryId = res.data.id;
      testData.categories.push(categoryId);
    });

    it('should create a subcategory', async () => {
      const res = await auth.post('/categories', {
        name: 'E2E Subcategory',
        establishmentId: establishmentId,
        parentId: parentCategoryId,
        isActive: true,
      });

      expect(res.status).toBe(201);
      expect(res.data.parentId).toBe(parentCategoryId);

      testData.categories.push(res.data.id);
    });

    it('should fail to create category without establishment', async () => {
      const res = await auth.post('/categories', {
        name: 'No Establishment Category',
      });

      expect(res.status).toBe(400);
    });

    it('should fail to create category with invalid parent', async () => {
      const res = await auth.post('/categories', {
        name: 'Invalid Parent Category',
        establishmentId: establishmentId,
        parentId: '00000000-0000-0000-0000-000000000000',
      });

      expect(res.status).toBe(404);
    });
  });

  describe('GET /categories', () => {
    it('should list categories (public)', async () => {
      const res = await axios.get('/categories');

      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty('data');
      expect(Array.isArray(res.data.data)).toBe(true);
    });

    it('should filter categories by establishment', async () => {
      const res = await axios.get(`/categories?establishmentId=${establishmentId}`);

      expect(res.status).toBe(200);
    });
  });

  describe('GET /categories/establishment/:establishmentId', () => {
    it('should list categories by establishment', async () => {
      const res = await axios.get(`/categories/establishment/${establishmentId}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.data)).toBe(true);
    });
  });

  describe('GET /categories/establishment/:establishmentId/root', () => {
    it('should list root categories', async () => {
      const res = await axios.get(`/categories/establishment/${establishmentId}/root`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.data)).toBe(true);
    });
  });

  describe('GET /categories/:id', () => {
    it('should get category by id', async () => {
      const res = await axios.get(`/categories/${categoryId}`);

      expect(res.status).toBe(200);
      expect(res.data.id).toBe(categoryId);
    });

    it('should return 404 for non-existent category', async () => {
      const res = await axios.get('/categories/00000000-0000-0000-0000-000000000000');

      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /categories/:id', () => {
    it('should update category', async () => {
      const newName = 'Updated Category Name';
      const res = await auth.patch(`/categories/${categoryId}`, {
        name: newName,
      });

      expect(res.status).toBe(200);
      expect(res.data.name).toBe(newName);
    });
  });

  describe('PATCH /categories/:id/sort-order', () => {
    it('should update category sort order', async () => {
      const res = await auth.patch(`/categories/${categoryId}/sort-order`, {
        sortOrder: 5,
      });

      expect(res.status).toBe(200);
      expect(res.data.sortOrder).toBe(5);
    });
  });

  describe('PATCH /categories/:id/toggle-active', () => {
    it('should toggle category active status', async () => {
      const res = await auth.patch(`/categories/${categoryId}/toggle-active`);

      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty('isActive');
    });
  });

  describe('DELETE /categories/:id', () => {
    it('should fail to delete category with subcategories', async () => {
      // parentCategoryId has subcategories
      const res = await auth.delete(`/categories/${parentCategoryId}`);

      expect([400, 409]).toContain(res.status);
    });
  });
});
