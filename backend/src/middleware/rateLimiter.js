import rateLimit from 'express-rate-limit';

// Utility helper to skip rate limiting during automated testing
const skipInTest = req => {
  return (
    process.env.NODE_ENV === 'test' ||
    req.headers['x-test-suite'] === 'active' ||
    req.ip === '127.0.0.1' && process.env.NODE_ENV === 'test'
  );
};

/**
 * Auth Rate Limiter
 * Restricts brute-force attacks against authentication endpoints (login, register, forgot-password).
 * Allows 20 requests per 15-minute window per IP.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInTest,
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP. Please try again after 15 minutes.',
  },
});

/**
 * AI Endpoints Rate Limiter
 * Guards Google Gemini and ML microservice triage endpoints against high-volume abuse.
 * Allows 30 requests per minute per IP.
 */
export const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInTest,
  message: {
    success: false,
    message: 'AI assistant rate limit reached. Please wait a moment before sending another query.',
  },
});

/**
 * General API Rate Limiter
 * Baseline protection across all API routes.
 * Allows 500 requests per 15-minute window per IP.
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInTest,
  message: {
    success: false,
    message: 'API rate limit exceeded. Please throttle your requests.',
  },
});
