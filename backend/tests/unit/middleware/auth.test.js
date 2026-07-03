const { auth, MOCK_TOKEN } = require('../../../src/middleware/auth');

describe('auth middleware', () => {
  /** @type {Partial<import('express').Request>} */
  let req;
  /** @type {Partial<import('express').Response>} */
  let res;
  let next;

  beforeEach(() => {
    req = { headers: {}, correlationId: 'test-correlation-id' };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  it('rejects request without Authorization header', () => {
    auth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 401,
        error: 'Unauthorized',
        correlationId: 'test-correlation-id',
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('rejects request with Authorization header not starting with Bearer', () => {
    req.headers.authorization = 'Basic abc123';

    auth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('rejects request with empty Bearer token', () => {
    req.headers.authorization = 'Bearer ';

    auth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('accepts request with valid Bearer token and attaches user to request', () => {
    req.headers.authorization = `Bearer ${MOCK_TOKEN}`;

    auth(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.user).toBeDefined();
    expect(req.user.id).toBe('user-001');
    expect(req.user.email).toBe('finops@segurosbolivar.com');
    expect(req.user.role).toBe('finops-analyst');
  });

  it('accepts any non-empty Bearer token (hackathon mode)', () => {
    req.headers.authorization = 'Bearer any-random-token-12345';

    auth(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.user).toBeDefined();
  });
});
