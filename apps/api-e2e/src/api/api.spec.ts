import axios from 'axios';

describe('API E2E - Basic Health Check', () => {
  it('should have a running API', async () => {
    // This is a basic smoke test to ensure the API is running
    const res = await axios.get('/health');
    expect([200, 503]).toContain(res.status);
  });
});
