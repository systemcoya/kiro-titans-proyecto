/**
 * Middleware: X-Correlation-ID propagation.
 * Generates a new UUID if the header is not present in the request.
 */
const { v4: uuidv4 } = require('uuid');

const correlationId = (req, res, next) => {
  const id = req.headers['x-correlation-id'] || uuidv4();
  req.correlationId = id;
  res.setHeader('X-Correlation-ID', id);
  next();
};

module.exports = { correlationId };
