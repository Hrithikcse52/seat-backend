import { Router } from 'express';
import { isAuth } from '../../middlewares/auth.middleware';
import { hasAccesstoWorkspace } from '../../middlewares/workspace.middleware';
import blogController from './blog.controller';

export const router = Router();

router.post('/create', isAuth, hasAccesstoWorkspace, blogController.create);
router.post('/', isAuth, hasAccesstoWorkspace, blogController.index);
