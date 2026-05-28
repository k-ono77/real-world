import { Hono } from 'hono';
import * as articleController from '../controllers/articleController';
import { zValidator } from "@hono/zod-validator";
import { createArticleSchema } from '../schemas/articleSchema';
import { formatValidationError } from '../helpers/validationHelper';

const router = new Hono();

router.post(
    '/', 
    zValidator("json", createArticleSchema, (result, c) =>{
        if(!result.success){
            return c.json(formatValidationError(result.error), 422)
        }
    }),
    articleController.createArticle);

router.post('/:slug/favorite', articleController.addFavorite);

router.delete('/:slug/favorite',articleController.deleteFavorie)

router.get('/', articleController.getGlobal);

router.get('/feed', articleController.getFeed);

router.get('/:slug', articleController.getArticle);

export default router;
