import axios from 'axios';
import {
  setupTestUser,
  authenticatedRequest,
  generateUniqueEmail,
  generateUniquePhone,
  generateUniqueCpf,
  testData,
} from '../support/test-helpers';

describe('Users E2E', () => {
  let auth: ReturnType<typeof authenticatedRequest>;
  let createdUserId: string;
  const testUserEmail = generateUniqueEmail();
  const testUserPhone = generateUniquePhone();

  beforeAll(async () => {
    await setupTestUser();
    auth = authenticatedRequest();
  });

  describe('POST /users', () => {
    it('should create a new user', async () => {
      const res = await axios.post('/users', {
        email: testUserEmail,
        password: 'TestPassword123!',
        name: 'Created Test User',
        phone: testUserPhone,
        cpf: generateUniqueCpf(),
      });

      expect(res.status).toBe(201);
      expect(res.data).toHaveProperty('id');
      expect(res.data.email).toBe(testUserEmail);

      createdUserId = res.data.id;
      testData.users.push(createdUserId);
    });

    it('should fail to create user with existing email', async () => {
      const res = await axios.post('/users', {
        email: testUserEmail,
        password: 'TestPassword123!',
        name: 'Duplicate User',
        phone: generateUniquePhone(),
      });

      expect(res.status).toBe(409);
    });

    it('should fail to create user with invalid data', async () => {
      const res = await axios.post('/users', {
        email: 'invalid-email',
        password: '123',
        name: '',
      });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /users', () => {
    it('should list users with pagination', async () => {
      const res = await auth.get('/users');

      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty('data');
      expect(Array.isArray(res.data.data)).toBe(true);
    });

    it('should filter users by email', async () => {
      const res = await auth.get(`/users?email=${testUserEmail}`);

      expect(res.status).toBe(200);
    });

    it('should fail to list users without authentication', async () => {
      const res = await axios.get('/users');

      expect(res.status).toBe(401);
    });
  });

  describe('GET /users/me', () => {
    it('should get current user data', async () => {
      const res = await auth.get('/users/me');

      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty('email');
      expect(res.data).toHaveProperty('name');
    });
  });

  describe('GET /users/:id', () => {
    it('should get user by id', async () => {
      const res = await auth.get(`/users/${createdUserId}`);

      expect(res.status).toBe(200);
      expect(res.data.id).toBe(createdUserId);
    });

    it('should return 404 for non-existent user', async () => {
      const res = await auth.get('/users/00000000-0000-0000-0000-000000000000');

      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /users/:id', () => {
    it('should update user', async () => {
      const newName = 'Updated User Name';
      const res = await auth.patch(`/users/${createdUserId}`, {
        name: newName,
      });

      expect(res.status).toBe(200);
      expect(res.data.name).toBe(newName);
    });
  });

  describe('PATCH /users/me/update', () => {
    it('should update own profile', async () => {
      const res = await auth.patch('/users/me/update', {
        name: 'My Updated Name',
      });

      expect(res.status).toBe(200);
    });
  });

  describe('POST /users/me/change-password', () => {
    it('should fail to change password with wrong current password', async () => {
      const res = await auth.post('/users/me/change-password', {
        currentPassword: 'WrongPassword123!',
        newPassword: 'NewTestPassword123!',
      });

      expect(res.status).toBe(400);
    });
  });

  describe('PATCH /users/:id/activate', () => {
    it('should activate user', async () => {
      const res = await auth.patch(`/users/${createdUserId}/activate`);

      expect(res.status).toBe(200);
    });
  });

  describe('PATCH /users/:id/deactivate', () => {
    it('should deactivate user', async () => {
      const res = await auth.patch(`/users/${createdUserId}/deactivate`);

      expect(res.status).toBe(200);
    });
  });

  describe('DELETE /users/:id', () => {
    it('should delete user', async () => {
      const res = await auth.delete(`/users/${createdUserId}`);

      expect(res.status).toBe(204);
      
      // Remove from test data since it's already deleted
      testData.users = testData.users.filter(id => id !== createdUserId);
    });

    it('should return 404 when deleting non-existent user', async () => {
      const res = await auth.delete('/users/00000000-0000-0000-0000-000000000000');

      expect(res.status).toBe(404);
    });
  });
});
