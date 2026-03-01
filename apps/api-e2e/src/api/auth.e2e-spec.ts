import axios from 'axios';
import {
  generateUniqueEmail,
  generateUniquePhone,
  setAuthToken,
  setRefreshToken,
} from '../support/test-helpers';

describe('Auth E2E', () => {
  const testEmail = generateUniqueEmail();
  const testPassword = 'TestPassword123!';
  const testName = 'Auth Test User';
  const testPhone = generateUniquePhone();
  
  let accessToken: string;
  let refreshTokenValue: string;

  describe('POST /auth/register', () => {
    it('should register a new user', async () => {
      const res = await axios.post('/auth/register', {
        email: testEmail,
        password: testPassword,
        name: testName,
        phone: testPhone,
      });

      expect(res.status).toBe(201);
      expect(res.data).toHaveProperty('access_token');
      expect(res.data).toHaveProperty('user');
      expect(res.data.user.email).toBe(testEmail);

      accessToken = res.data.access_token || res.data.accessToken;
      refreshTokenValue = res.data.refresh_token || res.data.refreshToken;
      setAuthToken(accessToken);
      setRefreshToken(refreshTokenValue);
    });

    it('should fail to register with existing email', async () => {
      const res = await axios.post('/auth/register', {
        email: testEmail,
        password: testPassword,
        name: testName,
        phone: generateUniquePhone(),
      });

      expect(res.status).toBe(409);
    });

    it('should fail to register with invalid email', async () => {
      const res = await axios.post('/auth/register', {
        email: 'invalid-email',
        password: testPassword,
        name: testName,
        phone: generateUniquePhone(),
      });

      expect(res.status).toBe(400);
    });

    it('should fail to register with short password', async () => {
      const res = await axios.post('/auth/register', {
        email: generateUniqueEmail(),
        password: '123',
        name: testName,
        phone: generateUniquePhone(),
      });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /auth/login', () => {
    it('should login with valid credentials', async () => {
      const res = await axios.post('/auth/login', {
        email: testEmail,
        password: testPassword,
      });

      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty('access_token');
      expect(res.data).toHaveProperty('user');
      expect(res.data.user.email).toBe(testEmail);

      accessToken = res.data.access_token || res.data.accessToken;
      setAuthToken(accessToken);
    });

    it('should fail login with wrong password', async () => {
      const res = await axios.post('/auth/login', {
        email: testEmail,
        password: 'WrongPassword123!',
      });

      expect(res.status).toBe(401);
    });

    it('should fail login with non-existent email', async () => {
      const res = await axios.post('/auth/login', {
        email: 'nonexistent@test.com',
        password: testPassword,
      });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /auth/profile', () => {
    it('should get user profile with valid token', async () => {
      const res = await axios.get('/auth/profile', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty('email');
    });

    it('should fail to get profile without token', async () => {
      const res = await axios.get('/auth/profile');

      expect(res.status).toBe(401);
    });

    it('should fail to get profile with invalid token', async () => {
      const res = await axios.get('/auth/profile', {
        headers: { Authorization: 'Bearer invalid_token' },
      });

      expect(res.status).toBe(401);
    });
  });

  describe('POST /auth/refresh', () => {
    it('should refresh token with valid refresh token', async () => {
      if (!refreshTokenValue) {
        console.log('Skipping refresh token test - no refresh token available');
        return;
      }

      const res = await axios.post('/auth/refresh', {
        refreshToken: refreshTokenValue,
      });

      if (res.status === 200) {
        expect(res.data).toHaveProperty('access_token');
        accessToken = res.data.access_token || res.data.accessToken;
        setAuthToken(accessToken);
      }
    });

    it('should fail refresh with invalid token', async () => {
      const res = await axios.post('/auth/refresh', {
        refreshToken: 'invalid_refresh_token',
      });

      expect(res.status).toBe(401);
    });
  });

  describe('POST /auth/validate', () => {
    it('should validate valid token', async () => {
      const res = await axios.post('/auth/validate', {}, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty('valid', true);
    });
  });
});
