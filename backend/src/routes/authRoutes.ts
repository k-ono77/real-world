import { Hono } from 'hono';
import * as authController from '../controllers/authController';
import { zValidator } from '@hono/zod-validator';
import { signupSchema, loginSchema } from "../schemas/authSchema"
import { formatValidationError } from '../helpers/validationHelper';

const router = new Hono();

router.post(
    '/',
    zValidator("json", signupSchema, (result, c) =>{
        if(!result.success){
            return c.json(formatValidationError(result.error), 422)
        }
    }),
    authController.siginUp);
    
    router.post(
        '/login',
        zValidator("json", loginSchema, (result, c) =>{
            if(!result.success){
                formatValidationError(result.error)
                return c.json({error: {body: "validation error"}}, 422)
            }
        }),
        authController.login);

export default router;