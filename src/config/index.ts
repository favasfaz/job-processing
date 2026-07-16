import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().url(),
  PG_POOL_MAX: z.coerce.number().default(10),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_DB: z.coerce.number().default(0),
  JWT_SECRET: z.string().min(1),
  JWT_EXPIRES_IN: z.string().default('24h'),
  ADMIN_USER: z.string().default('admin'),
  ADMIN_PASSWORD: z.string().default('admin'),
  WORKER_CONCURRENCY: z.coerce.number().default(5),
  WORKER_IDLE_MS: z.coerce.number().default(50),
  LOCK_TTL_SEC: z.coerce.number().default(30),
  HEARTBEAT_INTERVAL_MS: z.coerce.number().default(5000),
  STALLED_RECOVERY_INTERVAL_MS: z.coerce.number().default(5000),
  DELAYED_PROMOTE_INTERVAL_MS: z.coerce.number().default(1000),
  MAX_RETRIES: z.coerce.number().default(3),
  BACKOFF_BASE_MS: z.coerce.number().default(1000),
  BACKOFF_MAX_MS: z.coerce.number().default(60000),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60000),
  RATE_LIMIT_MAX: z.coerce.number().default(100),
  LOG_LEVEL: z.string().default('info'),
});

export type AppConfig = z.infer<typeof envSchema>;

export const config: AppConfig = envSchema.parse(process.env);
