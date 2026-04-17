import { Hono } from 'hono';
import * as articleController from '../controllers/articleController';

const router = new Hono();

router.post('/', articleController.createArticle);

export default router;