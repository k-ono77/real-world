import { Hono } from 'hono';
import * as authController from '../controllers/authController';


const router = new Hono();

router.post('/', authController.siginUp)

export default router;