import { Router } from 'express';
import { getWorkspaceController } from '../workspace/workspace.controller';

export const router = Router();

router.get('/workspace/:id', getWorkspaceController);
