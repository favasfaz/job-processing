import { NextFunction, Request, Response } from 'express';
import { ZodSchema } from 'zod';

export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        statusCode: 400,
        error: 'Bad Request',
        message: 'Invalid input',
        details: result.error.issues,
      });
      return;
    }

    req.body = result.data;
    next();
  };
}
