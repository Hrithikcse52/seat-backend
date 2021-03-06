import { Router } from 'express';
import { isAuth } from '../../middlewares/auth.middleware';
import { serializeWorkspace } from '../../middlewares/workspace.middleware';
import {
  createController,
  exploreData,
  getWorkspaceController,
  indexController,
  workspaceJoinController,
} from './workspace.controller';

export const router = Router();

router.post('/join', isAuth, serializeWorkspace, workspaceJoinController);
router.get('/explore', exploreData);
router.post('/', isAuth, createController);
router.get('/', isAuth, indexController);
router.get('/:id', isAuth, getWorkspaceController);
