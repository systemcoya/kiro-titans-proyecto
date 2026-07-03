const MOCK_TOKEN = 'mock-jwt-token-hackathon';

/**
 * Simulated JWT authentication middleware for hackathon prototype.
 * Accepts any Bearer token or the hardcoded mock token.
 * In production, this would validate against an institutional IdP.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      statusCode: 401,
      error: 'Unauthorized',
      message: 'Token de autenticación requerido',
      correlationId: req.correlationId || 'unknown',
    });
  }

  const token = authHeader.slice(7);

  if (!token || token.trim().length === 0) {
    return res.status(401).json({
      statusCode: 401,
      error: 'Unauthorized',
      message: 'Token de autenticación inválido',
      correlationId: req.correlationId || 'unknown',
    });
  }

  // For hackathon prototype: accept any non-empty Bearer token
  req.user = {
    id: 'user-001',
    email: 'finops@segurosbolivar.com',
    role: 'finops-analyst',
  };

  next();
};

module.exports = { auth, MOCK_TOKEN };
