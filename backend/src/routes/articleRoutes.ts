import { Hono } from 'hono';
import * as articleController from '../controllers/articleController';

const router = new Hono();

router.post('/', articleController.createArticle);

router.post('/:slug/favorite', articleController.addFavorite);

router.delete('/:slug/favorite',articleController.deleteFavorie)

router.get('/', articleController.getGlobal);

router.get('/feed', articleController.getFeed);

router.get('/:slug', articleController.getArticle);

export default router;