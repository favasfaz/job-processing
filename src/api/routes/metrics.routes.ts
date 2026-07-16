import { Router } from 'express';
import { MetricsController } from '../controllers/metrics.controller';

const router = Router();
const controller = new MetricsController();

router.get('/', controller.metrics);

export default router;
