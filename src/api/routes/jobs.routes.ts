import { Router } from 'express';
import { JobsController } from '../controllers/jobs.controller';
import { authMiddleware } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { createJobSchema } from '../schemas/job.schemas';

const router = Router();
const controller = new JobsController();

router.post('/', authMiddleware, validateBody(createJobSchema), controller.create);
router.get('/', authMiddleware, controller.list);
router.get('/:id', authMiddleware, controller.getById);
router.delete('/:id', authMiddleware, controller.cancel);

export default router;
