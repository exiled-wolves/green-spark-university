/**
 * Global error handler middleware.
 * Must be registered LAST in app.js after all routes.
 */
const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);

  // MySQL duplicate entry
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ message: 'A record with that value already exists.' });
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