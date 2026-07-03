const { v4: uuidV4 } = require('uuid');

const HEADER_NAME = 'x-correlation-id';

/**
 * Middleware that ensures every request has a Correlation ID.
 * If the incoming request includes an X-Correlation-ID header, it is preserved.
 * Otherwise, a new UUID v4 is generated and attached to the request and response.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const correlationId = (req, res, next) => {
  const incoming = req.headers[HEADER_NAME];
  const id = incoming || uuidV4();

  req.correlationId = id;
  res.setHeader('X-Correlation-ID', id);

  next();
};

module.exports = { correlationId };
