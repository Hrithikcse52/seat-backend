import { Router } from 'express';
import { getWorkspaceController } from '../workspace/workspace.controller';
import { getMetaProfile } from './meta.controller';

export const router = Router();

router.get('/workspace/:id', getWorkspaceController);
router.get('/profile/:username', getMetaProfile);
