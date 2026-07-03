const request = require('supertest');
const app = require('../../src/app');

describe('Express App Setup', () => {
  describe('GET /api/v1/health', () => {
    it('returns healthy status without authentication', async () => {
      const res = await request(app).get('/api/v1/health');

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('healthy');
      expect(res.body.timestamp).toBeDefined();
      expect(res.body.correlationId).toBeDefined();
    });

    it('returns X-Correlation-ID response header', async () => {
      const res = await request(app).get('/api/v1/health');

      expect(res.headers['x-correlation-id']).toBeDefined();
    });

    it('preserves incoming X-Correlation-ID', async () => {
      const correlationId = 'my-test-correlation-123';
      const res = await request(app)
        .get('/api/v1/health')
        .set('X-Correlation-ID', correlationId);

      expect(res.headers['x-correlation-id']).toBe(correlationId);
      expect(res.body.correlationId).toBe(correlationId);
    });
  });

  describe('Security headers (Helmet)', () => {
    it('returns security headers', async () => {
      const res = await request(app).get('/api/v1/health');

      expect(res.headers['x-content-type-options']).toBe('nosniff');
      expect(res.headers['x-frame-options']).toBe('SAMEORIGIN');
    });
  });

  describe('Authentication enforcement', () => {
    it('rejects unauthenticated requests to protected endpoints', async () => {
      const res = await request(app).get('/api/v1/costs/ai-spend');

      expect(res.status).toBe(401);
      expect(res.body.statusCode).toBe(401);
      expect(res.body.error).toBe('Unauthorized');
    });
  });

  describe('CORS', () => {
    it('returns CORS headers on preflight', async () => {
      const res = await request(app)
        .options('/api/v1/health')
        .set('Origin', 'http://localhost:5173')
        .set('Access-Control-Request-Method', 'GET');

      expect(res.headers['access-control-allow-origin']).toBe('http://localhost:5173');
    });
  });
});
