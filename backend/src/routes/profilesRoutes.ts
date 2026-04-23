import { Hono } from 'hono';
import * as profilesController from '../controllers/profilesController';

const router = new Hono();

router.get('/:username', profilesController.getProfile);

export default router;