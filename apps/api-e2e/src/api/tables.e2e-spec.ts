import axios from 'axios';
import {
  setupTestUser,
  setupTestEstablishment,
  authenticatedRequest,
  testData,
} from '../support/test-helpers';

describe('Tables E2E', () => {
  let auth: ReturnType<typeof authenticatedRequest>;
  let establishmentId: string;
  let tableId: string;
  const qrCode = `QR_${Date.now()}_${Math.random().toString(36).substring(7)}`;

  beforeAll(async () => {
    await setupTestUser();
    const establishment = await setupTestEstablishment();
    establishmentId = establishment.id;
    auth = authenticatedRequest();
  });

  describe('POST /tables', () => {
    it('should create a new table', async () => {
      const res = await auth.post('/tables', {
        number: 1,
        establishmentId: establishmentId,
        capacity: 4,
        qrCode: qrCode,
        isActive: true,
      });

      expect(res.status).toBe(201);
      expect(res.data).toHaveProperty('id');
      expect(res.data.number).toBe(1);
      expect(res.data.capacity).toBe(4);

      tableId = res.data.id;
      testData.tables.push(tableId);
    });

    it('should fail to create table with duplicate number', async () => {
      const res = await auth.post('/tables', {
        number: 1,
        establishmentId: establishmentId,
        capacity: 2,
      });

      expect(res.status).toBe(409);
    });

    it('should fail to create table with duplicate QR code', async () => {
      const res = await auth.post('/tables', {
        number: 99,
        establishmentId: establishmentId,
        capacity: 2,
        qrCode: qrCode,
      });

      expect(res.status).toBe(409);
    });

    it('should fail to create table without establishment', async () => {
      const res = await auth.post('/tables', {
        number: 2,
        capacity: 4,
      });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /tables', () => {
    it('should list tables (public)', async () => {
      const res = await axios.get('/tables');

      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty('data');
      expect(Array.isArray(res.data.data)).toBe(true);
    });

    it('should filter tables by establishment', async () => {
      const res = await axios.get(`/tables?establishmentId=${establishmentId}`);

      expect(res.status).toBe(200);
    });

    it('should filter tables by status', async () => {
      const res = await axios.get('/tables?status=AVAILABLE');

      expect(res.status).toBe(200);
    });
  });

  describe('GET /tables/establishment/:establishmentId', () => {
    it('should list tables by establishment', async () => {
      const res = await axios.get(`/tables/establishment/${establishmentId}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.data)).toBe(true);
    });
  });

  describe('GET /tables/qr-code/:qrCode', () => {
    it('should find table by QR code', async () => {
      const res = await axios.get(`/tables/qr-code/${qrCode}`);

      expect(res.status).toBe(200);
      expect(res.data.qrCode).toBe(qrCode);
    });

    it('should return 404 for non-existent QR code', async () => {
      const res = await axios.get('/tables/qr-code/NONEXISTENT');

      expect(res.status).toBe(404);
    });
  });

  describe('GET /tables/:id', () => {
    it('should get table by id', async () => {
      const res = await axios.get(`/tables/${tableId}`);

      expect(res.status).toBe(200);
      expect(res.data.id).toBe(tableId);
    });

    it('should return 404 for non-existent table', async () => {
      const res = await axios.get('/tables/00000000-0000-0000-0000-000000000000');

      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /tables/:id', () => {
    it('should update table', async () => {
      const res = await auth.patch(`/tables/${tableId}`, {
        capacity: 6,
      });

      expect(res.status).toBe(200);
      expect(res.data.capacity).toBe(6);
    });
  });

  describe('PATCH /tables/:id/status', () => {
    it('should update table status to OCCUPIED', async () => {
      const res = await auth.patch(`/tables/${tableId}/status`, {
        status: 'OCCUPIED',
      });

      expect(res.status).toBe(200);
      expect(res.data.status).toBe('OCCUPIED');
    });

    it('should update table status to RESERVED', async () => {
      const res = await auth.patch(`/tables/${tableId}/status`, {
        status: 'RESERVED',
      });

      expect(res.status).toBe(200);
      expect(res.data.status).toBe('RESERVED');
    });

    it('should update table status to AVAILABLE', async () => {
      const res = await auth.patch(`/tables/${tableId}/status`, {
        status: 'AVAILABLE',
      });

      expect(res.status).toBe(200);
      expect(res.data.status).toBe('AVAILABLE');
    });
  });

  describe('PATCH /tables/:id/toggle-active', () => {
    it('should toggle table active status', async () => {
      const res = await auth.patch(`/tables/${tableId}/toggle-active`);

      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty('isActive');
    });
  });

  describe('DELETE /tables/:id', () => {
    it('should delete table', async () => {
      // Create table to delete
      const createRes = await auth.post('/tables', {
        number: 999,
        establishmentId: establishmentId,
        capacity: 2,
      });
      const deleteId = createRes.data.id;

      const res = await auth.delete(`/tables/${deleteId}`);

      expect(res.status).toBe(204);
    });
  });
});
