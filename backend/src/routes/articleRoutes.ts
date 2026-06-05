import { Hono } from 'hono';
import * as articleController from '../controllers/articleController';
import { zValidator } from "@hono/zod-validator";
import { createArticleSchema, updateArticleSchema } from '../schemas/articleSchema';
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

router.put(
    '/:slug',
    zValidator("json", updateArticleSchema, (result, c) =>{
        if(!result.success){
            return c.json(formatValidationError(result.error), 422)
        }
    }),
    articleController.updateArticle);

router.post('/:slug/favorite', articleController.addFavorite);

router.delete('/:slug/favorite',articleController.deleteFavorie)

router.get('/', articleController.getGlobal);

router.get('/feed', articleController.getFeed);

router.get('/:slug', articleController.getArticle);

router.delete(
    '/:slug',
    articleController.deleteArticle);
    
router.get('/:slug/comments',articleController.getComments);

export default router
