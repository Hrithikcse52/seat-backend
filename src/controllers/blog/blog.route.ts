import { Router } from 'express';
import { isAuth } from '../../middlewares/auth.middleware';
import { hasAccesstoWorkspace, serializeWorkspace } from '../../middlewares/workspace.middleware';
import { blogIndexController, blogReactionController, createBlogController } from './blog.controller';

export const router = Router();

router.post('/create', isAuth, serializeWorkspace, hasAccesstoWorkspace, createBlogController);
router.post('/', isAuth, serializeWorkspace, hasAccesstoWorkspace, blogIndexController);
router.post('/reaction', isAuth, serializeWorkspace, hasAccesstoWorkspace, blogReactionController);
