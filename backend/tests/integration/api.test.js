const request = require('supertest');
const app = require('../../src/app');

const MOCK_TOKEN = 'Bearer mock-jwt-token-hackathon';

/**
 * Integration Tests — Task 16.3
 * Validates all API endpoints respond correctly with proper status codes,
 * authentication, and response structure.
 */

describe('API Integration Tests', () => {
  describe('Authentication', () => {
    it('returns 401 when no token provided', async () => {
      const res = await request(app).get('/api/v1/alerts');
      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Unauthorized');
      expect(res.body.correlationId).toBeDefined();
    });

    it('returns 401 when invalid token provided', async () => {
      const res = await request(app)
        .get('/api/v1/alerts')
        .set('Authorization', 'Bearer ');
      expect(res.status).toBe(401);
    });
  });

  describe('Health Endpoint', () => {
    it('GET /api/v1/health returns 200 with status and correlationId', async () => {
      const res = await request(app).get('/api/v1/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('healthy');
      expect(res.body.correlationId).toBeDefined();
      expect(res.body.timestamp).toBeDefined();
    });
  });

  describe('Alerts Endpoints', () => {
    it('GET /api/v1/alerts returns 200 with data array', async () => {
      const res = await request(app)
        .get('/api/v1/alerts')
        .set('Authorization', MOCK_TOKEN);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('POST /api/v1/alerts validates required fields', async () => {
      const res = await request(app)
        .post('/api/v1/alerts')
        .set('Authorization', MOCK_TOKEN)
        .send({});
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Bad Request');
    });

    it('GET /api/v1/alerts/history returns 200', async () => {
      const res = await request(app)
        .get('/api/v1/alerts/history')
        .set('Authorization', MOCK_TOKEN);
      expect(res.status).toBe(200);
    });
  });

  describe('Simulator Endpoint', () => {
    it('POST /api/v1/simulator/project validates input range', async () => {
      const res = await request(app)
        .post('/api/v1/simulator/project')
        .set('Authorization', MOCK_TOKEN)
        .send({
          serviceIncrements: [{
            serviceId: '550e8400-e29b-41d4-a716-446655440000',
            percentIncrement: 250, // exceeds max 200
          }],
        });
      expect(res.status).toBe(400);
      expect(res.body.details).toBeDefined();
    });

    it('POST /api/v1/simulator/project returns projection for valid input', async () => {
      const res = await request(app)
        .post('/api/v1/simulator/project')
        .set('Authorization', MOCK_TOKEN)
        .send({
          serviceIncrements: [{
            serviceId: '550e8400-e29b-41d4-a716-446655440000',
            percentIncrement: 30,
          }],
        });
      expect(res.status).toBe(200);
      expect(res.body.intervals).toBeDefined();
      expect(res.body.intervals).toHaveLength(3);
      expect(res.body.intervals[0].months).toBe(1);
      expect(res.body.intervals[0].optimistic).toBeDefined();
      expect(res.body.intervals[0].base).toBeDefined();
      expect(res.body.intervals[0].pessimistic).toBeDefined();
    });

    it('POST /api/v1/simulator/project rejects empty array', async () => {
      const res = await request(app)
        .post('/api/v1/simulator/project')
        .set('Authorization', MOCK_TOKEN)
        .send({ serviceIncrements: [] });
      expect(res.status).toBe(400);
    });
  });

  describe('Governance Endpoints', () => {
    it('GET /api/v1/governance/policies returns 200 with data', async () => {
      const res = await request(app)
        .get('/api/v1/governance/policies')
        .set('Authorization', MOCK_TOKEN);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
    });

    it('GET /api/v1/governance/recommendations returns 200', async () => {
      const res = await request(app)
        .get('/api/v1/governance/recommendations')
        .set('Authorization', MOCK_TOKEN);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
    });

    it('POST /api/v1/governance/policies validates input', async () => {
      const res = await request(app)
        .post('/api/v1/governance/policies')
        .set('Authorization', MOCK_TOKEN)
        .send({});
      expect(res.status).toBe(400);
    });
  });

  describe('Self-Funding Endpoint', () => {
    it('GET /api/v1/self-funding returns dashboard data', async () => {
      const res = await request(app)
        .get('/api/v1/self-funding')
        .set('Authorization', MOCK_TOKEN);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('ratio');
      expect(res.body).toHaveProperty('isSelfFunded');
      expect(res.body).toHaveProperty('investment');
      expect(res.body).toHaveProperty('savings');
    });

    it('GET /api/v1/self-funding/timeline returns timeline data', async () => {
      const res = await request(app)
        .get('/api/v1/self-funding/timeline')
        .set('Authorization', MOCK_TOKEN);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('months');
    });
  });

  describe('Executive Endpoint', () => {
    it('GET /api/v1/executive/summary returns executive data', async () => {
      const res = await request(app)
        .get('/api/v1/executive/summary')
        .set('Authorization', MOCK_TOKEN);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('totalSpend');
      expect(res.body).toHaveProperty('topConsumers');
      expect(res.body).toHaveProperty('criticalAlertsCount');
      expect(res.body).toHaveProperty('selfFundingRatio');
    });
  });

  describe('FinOps Summary — RT-10 Contract', () => {
    it('GET /api/v1/finops/summary returns exact RT-10 schema', async () => {
      const res = await request(app)
        .get('/api/v1/finops/summary')
        .set('Authorization', MOCK_TOKEN);
      expect(res.status).toBe(200);

      // Exact 4 fields per contract
      const keys = Object.keys(res.body);
      expect(keys).toHaveLength(4);
      expect(keys).toContain('status');
      expect(keys).toContain('kpi_principal');
      expect(keys).toContain('trend');
      expect(keys).toContain('alerts_count');

      // Type validations
      expect(['healthy', 'warning', 'critical']).toContain(res.body.status);
      expect(['up', 'down', 'stable']).toContain(res.body.trend);
      expect(typeof res.body.alerts_count).toBe('number');
      expect(res.body.alerts_count).toBeGreaterThanOrEqual(0);

      // kpi_principal structure
      expect(res.body.kpi_principal).toHaveProperty('label');
      expect(res.body.kpi_principal).toHaveProperty('value');
      expect(res.body.kpi_principal).toHaveProperty('unit');
      expect(typeof res.body.kpi_principal.label).toBe('string');
      expect(typeof res.body.kpi_principal.value).toBe('number');
      expect(['COP', '%']).toContain(res.body.kpi_principal.unit);
    });
  });

  describe('Correlation-ID propagation', () => {
    it('every response includes X-Correlation-ID header', async () => {
      const res = await request(app).get('/api/v1/health');
      expect(res.headers['x-correlation-id']).toBeDefined();
      expect(res.headers['x-correlation-id'].length).toBeGreaterThan(0);
    });

    it('correlation IDs are unique per request', async () => {
      const res1 = await request(app).get('/api/v1/health');
      const res2 = await request(app).get('/api/v1/health');
      expect(res1.headers['x-correlation-id']).not.toBe(res2.headers['x-correlation-id']);
    });
  });
});
