/**
 * Middleware: Simulated JWT authentication.
 * For hackathon prototype — accepts any Bearer token.
 * In production, validate JWT signature against institutional IdP.
 */
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      statusCode: 401,
      error: 'Unauthorized',
      message: 'Missing or invalid authorization token',
      correlationId: req.correlationId,
    });
  }

  const token = authHeader.slice(7);
  if (!token || token.trim().length === 0) {
    return res.status(401).json({
      statusCode: 401,
      error: 'Unauthorized',
      message: 'Missing or invalid authorization token',
      correlationId: req.correlationId,
    });
  }

  // Simulated user extraction (mock)
  req.user = {
    id: 'user-001',
    email: 'demo@segurosbolivar.com',
    role: 'admin',
  };

  next();
};

module.exports = { authenticate };
