import { Hono } from 'hono';
import * as articleController from '../controllers/articleController';

const router = new Hono();

router.post('/', articleController.createArticle);

router.get('/:slug', articleController.getArticle);

export default router;