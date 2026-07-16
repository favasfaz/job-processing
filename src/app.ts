import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler } from './api/middleware/error-handler';
import authRoutes from './api/routes/auth.routes';
import jobsRoutes from './api/routes/jobs.routes';
import healthRoutes from './api/routes/health.routes';
import metricsRoutes from './api/routes/metrics.routes';
import { rateLimitMiddleware } from './api/middleware/rate-limit';
import { logger } from './services/logger.service';
import pinoHttp from 'pino-http';
import swaggerUi from 'swagger-ui-express';
import { swaggerDocument } from './api/swagger';

export function createApp() {
  const app = express();
  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(pinoHttp({ logger }));

  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  app.get('/api/docs.json', (_req, res) => res.json(swaggerDocument));

  app.use('/api/v1/auth', rateLimitMiddleware, authRoutes);
  app.use('/api/v1/jobs', jobsRoutes);
  app.use('/api/v1/health', healthRoutes);
  app.use('/api/v1/metrics', metricsRoutes);

  app.use(errorHandler);

  return app;
}
