import {
  setupTestUser,
  setupTestEstablishment,
  authenticatedRequest,
} from '../support/test-helpers';

describe('Cashier Sessions E2E', () => {
  let auth: ReturnType<typeof authenticatedRequest>;
  let establishmentId: string;
  let cashierSessionId: string;

  beforeAll(async () => {
    await setupTestUser();
    const establishment = await setupTestEstablishment();
    establishmentId = establishment.id;
    auth = authenticatedRequest();
  });

  describe('POST /cashier-sessions/open', () => {
    it('should open a cashier session', async () => {
      const res = await auth.post('/cashier-sessions/open', {
        establishmentId: establishmentId,
        openingBalance: 500.00,
        notes: 'E2E Test Session',
      });

      expect(res.status).toBe(201);
      expect(res.data).toHaveProperty('id');
      expect(res.data.status).toBe('OPEN');

      cashierSessionId = res.data.id;
    });

    it('should fail to open second session for same user', async () => {
      const res = await auth.post('/cashier-sessions/open', {
        establishmentId: establishmentId,
        openingBalance: 100.00,
      });

      expect(res.status).toBe(409);
    });
  });

  describe('GET /cashier-sessions', () => {
    it('should list cashier sessions', async () => {
      const res = await auth.get('/cashier-sessions');

      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty('data');
      expect(Array.isArray(res.data.data)).toBe(true);
    });

    it('should filter sessions by establishment', async () => {
      const res = await auth.get(`/cashier-sessions?establishmentId=${establishmentId}`);

      expect(res.status).toBe(200);
    });
  });

  describe('GET /cashier-sessions/active', () => {
    it('should get active session', async () => {
      const res = await auth.get('/cashier-sessions/active');

      expect(res.status).toBe(200);
      expect(res.data.id).toBe(cashierSessionId);
    });
  });

  describe('GET /cashier-sessions/:id', () => {
    it('should get session by id', async () => {
      const res = await auth.get(`/cashier-sessions/${cashierSessionId}`);

      expect(res.status).toBe(200);
      expect(res.data.id).toBe(cashierSessionId);
    });

    it('should return 404 for non-existent session', async () => {
      const res = await auth.get('/cashier-sessions/00000000-0000-0000-0000-000000000000');

      expect(res.status).toBe(404);
    });
  });

  describe('GET /cashier-sessions/:id/report', () => {
    it('should get session report', async () => {
      const res = await auth.get(`/cashier-sessions/${cashierSessionId}/report`);

      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty('openingBalance');
    });
  });

  describe('POST /cashier-sessions/movements', () => {
    it('should create cash withdrawal', async () => {
      const res = await auth.post('/cashier-sessions/movements', {
        cashierSessionId: cashierSessionId,
        type: 'WITHDRAWAL',
        amount: 50.00,
        description: 'Test withdrawal',
      });

      expect(res.status).toBe(201);
      expect(res.data).toHaveProperty('id');
    });

    it('should create cash deposit', async () => {
      const res = await auth.post('/cashier-sessions/movements', {
        cashierSessionId: cashierSessionId,
        type: 'DEPOSIT',
        amount: 100.00,
        description: 'Test deposit',
      });

      expect(res.status).toBe(201);
    });
  });

  describe('GET /cashier-sessions/:id/movements', () => {
    it('should list session movements', async () => {
      const res = await auth.get(`/cashier-sessions/${cashierSessionId}/movements`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.data)).toBe(true);
    });
  });

  describe('GET /cashier-sessions/report/daily/:establishmentId', () => {
    it('should get daily report', async () => {
      const res = await auth.get(`/cashier-sessions/report/daily/${establishmentId}`);

      expect(res.status).toBe(200);
    });

    it('should get daily report for specific date', async () => {
      const today = new Date().toISOString().split('T')[0];
      const res = await auth.get(`/cashier-sessions/report/daily/${establishmentId}?date=${today}`);

      expect(res.status).toBe(200);
    });
  });

  describe('POST /cashier-sessions/:id/close', () => {
    it('should close cashier session', async () => {
      const res = await auth.post(`/cashier-sessions/${cashierSessionId}/close`, {
        closingBalance: 550.00,
        notes: 'Session closed by E2E test',
      });

      expect(res.status).toBe(200);
      expect(res.data.status).toBe('CLOSED');
    });

    it('should fail to close already closed session', async () => {
      const res = await auth.post(`/cashier-sessions/${cashierSessionId}/close`, {
        closingBalance: 500.00,
      });

      expect(res.status).toBe(400);
    });
  });
});
