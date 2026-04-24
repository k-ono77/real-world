import { Hono } from 'hono';
import * as profilesController from '../controllers/profilesController';

const router = new Hono();

router.get('/:username', profilesController.getProfile);

router.post('/:username/follow',profilesController.followUser);

export default router;