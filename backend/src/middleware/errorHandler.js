import { ZodError } from 'zod';

/**
 * Centralized Error Handling Middleware
 * Ensures predictable error response linearity across all backend REST endpoints
 */
export const errorHandler = (err, req, res, _next) => {
  // 1. Zod Validation Errors
  if (err instanceof ZodError) {
    const errorMessages = err.errors.map(e => e.message);
    return res.status(400).json({
      success: false,
      message: errorMessages[0] || 'Validation error',
      errors: errorMessages,
    });
  }

  // 2. JWT Verification Errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(403).json({
      success: false,
      message: 'Invalid access token',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Access token expired. Please log in again.',
    });
  }

  // 3. Bad JSON Request Body Payload
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      message: 'Malformed JSON payload in request body',
    });
  }

  // 4. Default Internal Server Error
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal server error';

  if (process.env.NODE_ENV !== 'test') {
    console.error(`[Error] ${req.method} ${req.originalUrl}:`, err);
  }

  return res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
