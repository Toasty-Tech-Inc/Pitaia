import axios from 'axios';

describe('Health Check E2E', () => {
  describe('GET /health', () => {
    it('should return health status', async () => {
      const res = await axios.get('/health');

      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty('status');
    });
  });
});
