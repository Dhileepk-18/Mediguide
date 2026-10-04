import { z } from 'zod';

/**
 * Reusable Zod Validation Middleware for MediGuide endpoints.
 * Validates req.body, req.query, or req.params against a Zod schema.
 * Rejects invalid payloads with status 400 and structured error feedback.
 */
export const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      const parsed = schema.parse(req[source]);
      req[source] = parsed;
      next();
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: err.errors[0]?.message || 'Invalid request payload',
          errors: err.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        });
      }
      return res.status(400).json({ success: false, message: 'Malformed request payload' });
    }
  };
};
