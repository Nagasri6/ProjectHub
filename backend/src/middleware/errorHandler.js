import { ApiError } from '../utils/apiError.js';

export function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  if (err instanceof ApiError) {
    return res.status(err.status).json({
      message: err.message,
      details: err.details,
    });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Validation failed',
      details: Object.values(err.errors).map((item) => item.message),
    });
  }

  if (err.code === 11000) {
    return res.status(409).json({ message: 'A record with that value already exists' });
  }

  console.error(err);
  return res.status(500).json({ message: 'Something went wrong on the server' });
}

export function notFound(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}
