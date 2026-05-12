import { Hono } from 'hono';
import * as popularAuthorsController from '../controllers/popularAuthorsController';

const router = new Hono();

router.get('/', popularAuthorsController.getAuthors);

export default router;