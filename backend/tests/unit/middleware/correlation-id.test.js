const { correlationId } = require('../../../src/middleware/correlation-id');

describe('correlation-id middleware', () => {
  /** @type {Partial<import('express').Request>} */
  let req;
  /** @type {Partial<import('express').Response>} */
  let res;
  let next;

  beforeEach(() => {
    req = { headers: {} };
    res = { setHeader: jest.fn() };
    next = jest.fn();
  });

  it('generates a UUID v4 when no X-Correlation-ID header is present', () => {
    correlationId(req, res, next);

    expect(req.correlationId).toBeDefined();
    expect(req.correlationId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );
    expect(res.setHeader).toHaveBeenCalledWith('X-Correlation-ID', req.correlationId);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('preserves existing X-Correlation-ID from request header', () => {
    const existingId = 'existing-correlation-id-123';
    req.headers['x-correlation-id'] = existingId;

    correlationId(req, res, next);

    expect(req.correlationId).toBe(existingId);
    expect(res.setHeader).toHaveBeenCalledWith('X-Correlation-ID', existingId);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('calls next() to continue request processing', () => {
    correlationId(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith();
  });
});
