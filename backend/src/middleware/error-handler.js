/**
 * Middleware: Centralized error handler.
 * Returns standard APIError format with correlationId.
 * Generic messages to client, details only in logs.
 */

/**
 * Custom API Error class.
 * @param {number} statusCode - HTTP status code
 * @param {string} error - Error type label
 * @param {string} message - Human-readable message
 * @param {Array} [details] - Field-level error details
 */
class APIError extends Error {
  constructor(statusCode, error, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.error = error;
    this.details = details;
  }
}

/**
 * Express error-handling middleware.
 * @param {Error} err
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} _next
 */
const errorHandler = (err, req, res, _next) => {
  const correlationId = req.correlationId || 'unknown';

  // Log full error internally
  console.error('[ERROR]', {
    correlationId,
    statusCode: err.statusCode || 500,
    message: err.message,
    stack: err.stack,
    timestamp: new Date().toISOString(),
  });

  if (err instanceof APIError) {
    const response = {
      statusCode: err.statusCode,
      error: err.error,
      message: err.message,
      correlationId,
    };
    if (err.details) {
      response.details = err.details;
    }
    return res.status(err.statusCode).json(response);
  }

  // Generic response for unhandled errors — never expose internals
  return res.status(500).json({
    statusCode: 500,
    error: 'Internal Server Error',
    message: 'An unexpected error occurred',
    correlationId,
  });
};

module.exports = { APIError, errorHandler };
