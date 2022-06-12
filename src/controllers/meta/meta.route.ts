import { Router } from 'express';
import { getWorkspaceController } from '../workspace/workspace.controller';
import { getIndexUsers, getMetaProfile } from './meta.controller';

export const router = Router();

router.get('/workspace/:id', getWorkspaceController);
router.get('/profile/:username', getMetaProfile);
router.get('/users', getIndexUsers);
