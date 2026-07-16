import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validateBody } from '../middleware/validate';
import { authSchema } from '../schemas/job.schemas';

const router = Router();
const controller = new AuthController();

router.post('/login', validateBody(authSchema), controller.login);

export default router;
