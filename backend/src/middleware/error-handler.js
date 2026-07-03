/**
 * Custom API error class with structured fields.
 * Provides standard error format for all API responses.
 */
class APIError extends Error {
  /**
   * @param {number} statusCode - HTTP status code
   * @param {string} error - Error type label (e.g., 'Bad Request', 'Not Found')
   * @param {string} message - User-facing generic message
   * @param {Array<{field: string, reason: string}>} [details] - Field-level validation errors
   */
  constructor(statusCode, error, message, details) {
    super(message);
    this.statusCode = statusCode;
    this.error = error;
    this.details = details;
    this.name = 'APIError';
  }
}

/**
 * Express error-handling middleware.
 * Logs detailed error internally, returns generic APIError format to client.
 * @param {Error} err
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} _next
 */
const errorHandler = (err, req, res, _next) => {
  const correlationId = req.correlationId || 'unknown';

  // Log detailed error internally (structured logging)
  console.error('[error-handler]', {
    correlationId,
    method: req.method,
    path: req.path,
    statusCode: err.statusCode || 500,
    errorName: err.name,
    message: err.message,
    stack: err.stack,
  });

  if (err instanceof APIError) {
    const response = {
      statusCode: err.statusCode,
      error: err.error,
      message: err.message,
      correlationId,
    };

    if (err.details && err.details.length > 0) {
      response.details = err.details;
    }

    return res.status(err.statusCode).json(response);
  }

  // Generic error — never expose internals to the client
  return res.status(500).json({
    statusCode: 500,
    error: 'Internal Server Error',
    message: 'Ha ocurrido un error interno. Intente nuevamente.',
    correlationId,
  });
};

module.exports = { APIError, errorHandler };
