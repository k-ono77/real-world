import { Hono } from 'hono';
import * as authController from '../controllers/authcontroller';


const router = new Hono();

router.post('/', authController.siginUp)

export default router;