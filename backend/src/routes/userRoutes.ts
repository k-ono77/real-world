import { Hono } from 'hono';
import * as userController from '../controllers/userController';


const router = new Hono();

router.put('/', userController.settingUpdate);

export default router;