import { Hono } from 'hono';
import * as tagsController from '../controllers/tagsController'

const router = new Hono();
router.get('/', tagsController.getTags);

export default router;