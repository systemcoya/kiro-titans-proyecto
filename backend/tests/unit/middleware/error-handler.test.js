const { APIError, errorHandler } = require('../../../src/middleware/error-handler');

describe('error-handler middleware', () => {
  /** @type {Partial<import('express').Request>} */
  let req;
  /** @type {Partial<import('express').Response>} */
  let res;
  let next;

  beforeEach(() => {
    req = { correlationId: 'test-correlation-id', method: 'GET', path: '/test' };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('handles APIError with correct status code and format', () => {
    const err = new APIError(400, 'Bad Request', 'Datos inválidos', [
      { field: 'threshold', reason: 'Debe ser mayor a 0.01' },
    ]);

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      statusCode: 400,
      error: 'Bad Request',
      message: 'Datos inválidos',
      details: [{ field: 'threshold', reason: 'Debe ser mayor a 0.01' }],
      correlationId: 'test-correlation-id',
    });
  });

  it('handles APIError without details', () => {
    const err = new APIError(404, 'Not Found', 'Recurso no encontrado');

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    const responseBody = res.json.mock.calls[0][0];
    expect(responseBody.details).toBeUndefined();
  });

  it('handles generic Error with 500 and generic message (no internals exposed)', () => {
    const err = new Error('Database connection failed: password incorrect');

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      statusCode: 500,
      error: 'Internal Server Error',
      message: 'Ha ocurrido un error interno. Intente nuevamente.',
      correlationId: 'test-correlation-id',
    });
  });

  it('logs detailed error internally', () => {
    const err = new Error('SQL syntax error');

    errorHandler(err, req, res, next);

    expect(console.error).toHaveBeenCalledWith(
      '[error-handler]',
      expect.objectContaining({
        correlationId: 'test-correlation-id',
        method: 'GET',
        path: '/test',
        message: 'SQL syntax error',
      })
    );
  });

  it('uses "unknown" correlationId when not available on request', () => {
    req.correlationId = undefined;
    const err = new Error('test');

    errorHandler(err, req, res, next);

    const responseBody = res.json.mock.calls[0][0];
    expect(responseBody.correlationId).toBe('unknown');
  });
});

describe('APIError class', () => {
  it('creates instance with correct properties', () => {
    const err = new APIError(422, 'Unprocessable Entity', 'Datos insuficientes');

    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(APIError);
    expect(err.statusCode).toBe(422);
    expect(err.error).toBe('Unprocessable Entity');
    expect(err.message).toBe('Datos insuficientes');
    expect(err.name).toBe('APIError');
  });
});
