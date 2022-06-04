import { Router } from 'express';
import { isAuth } from '../../middlewares/auth.middleware';
import { hasAccesstoWorkspace, serializeWorkspace } from '../../middlewares/workspace.middleware';
import blogController from './blog.controller';

export const router = Router();

router.post('/create', isAuth, serializeWorkspace, hasAccesstoWorkspace, blogController.create);
router.post('/', isAuth, serializeWorkspace, hasAccesstoWorkspace, blogController.index);
