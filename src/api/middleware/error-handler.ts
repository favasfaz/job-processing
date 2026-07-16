import { NextFunction, Request, Response } from 'express';
import { DomainError } from '../../utils/errors';

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  // Temporary verbose logging to surface internal errors during debugging
  // Remove or reduce verbosity once root cause is fixed
  // eslint-disable-next-line no-console
  console.error('Unhandled error caught by errorHandler:', err);
  if (err instanceof DomainError) {
    res.status(err.statusCode).json({ statusCode: err.statusCode, error: err.name, message: err.message });
    return;
  }

  res.status(500).json({ statusCode: 500, error: 'Internal Server Error', message: 'Unexpected failure' });
}
