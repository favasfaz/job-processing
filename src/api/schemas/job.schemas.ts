import { z } from 'zod';

export const createJobSchema = z.object({
  type: z.enum(['email', 'sms', 'image', 'webhook', 'custom']),
  priority: z.enum(['high', 'normal', 'low']).optional(),
  payload: z.object({}).passthrough().required(),
  delay: z.number().min(0).max(86_400_000).optional(),
  runAt: z.string().optional(),
  maxRetries: z.number().min(0).max(10).optional(),
  idempotencyKey: z.string().max(128).optional(),
});

export const authSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});
