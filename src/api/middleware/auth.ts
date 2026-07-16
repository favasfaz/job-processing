import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../../config';

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ statusCode: 401, error: 'Unauthorized', message: 'Missing bearer token' });
    return;
  }

  try {
    const token = authHeader.slice(7);
    const payload = jwt.verify(token, config.JWT_SECRET) as { sub: string };
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ statusCode: 401, error: 'Unauthorized', message: 'Invalid token' });
  }
}
