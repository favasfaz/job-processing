import { NextFunction, Request, Response } from 'express';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { config } from '../../config';

const rateLimiter = new RateLimiterMemory({
  points: config.RATE_LIMIT_MAX,
  duration: config.RATE_LIMIT_WINDOW_MS / 1000,
});

export function rateLimitMiddleware(req: Request, res: Response, next: NextFunction): void {
  void rateLimiter
    .consume(req.ip ?? 'unknown')
    .then(() => next())
    .catch(() => {
      res.status(429).json({ statusCode: 429, error: 'Too Many Requests', message: 'Rate limit exceeded' });
    });
}
