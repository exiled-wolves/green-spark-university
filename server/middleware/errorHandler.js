/**
 * Global error handler middleware.
 * Must be registered LAST in app.js after all routes.
 */
const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);

  // PostgreSQL unique violation (was MySQL ER_DUP_ENTRY)
  if (err.code === '23505') {
    return res.status(409).json({ message: 'A record with that value already exists.' });
  }

  // PostgreSQL foreign key violation
  if (err.code === '23503') {
    return res.status(400).json({ message: 'Referenced record does not exist.' });
  }

  // PostgreSQL not null violation
  if (err.code === '23502') {
    return res.status(400).json({ message: 'Required field is missing.' });
  }

  // Validation errors from express-validator (forwarded manually)
  if (err.type === 'validation') {
    return res.status(422).json({ message: 'Validation failed.', errors: err.errors });
  }

  const status = err.status || 500;
  res.status(status).json({
    message: err.message || 'Internal server error.',
  });
};

module.exports = errorHandler;
