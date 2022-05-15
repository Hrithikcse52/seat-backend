import { Router } from 'express';
import mongoose from 'mongoose';
import {
  createWorkSpace,
  getAllWorkspace,
} from '../../databaseQueries/workspace.queries';
import { isAuth } from '../../middlewares/auth.middleware';
import { ReqMod } from '../../types/util.types';
import { WorkspaceInput } from '../../models/workspace/workspace.model';

export const router = Router();

router.get('/', isAuth, async (req: ReqMod, res) => {
  const { user } = req;
  if (!user) {
    return res.status(401).send({ user: null, message: 'Login' });
  }
  const data = await getAllWorkspace({ 'permission.user': user._id });
  return res.send(data);
});

router.get('/explore', async (_, res) => {
  const data = await getAllWorkspace({ status: 'active' });
  console.log('data', data);
  return res.send(data);
});

router.post('/', isAuth, async (req: ReqMod, res) => {
  try {
    const { name, description, location, membership } = req.body;
    const { user } = req;
    console.log(
      '🚀 ~ file: workspace.controller.ts ~ line 13 ~ router.post ~  name, description, location, membership ',
      name,
      description,
      location,
      membership,
      req.user
    );
    if (!user) {
      return res.status(401).send({ user: null, message: 'login' });
    }

    const permission = [
      { user: user._id as mongoose.Schema.Types.ObjectId, role: 'admin' },
    ];
    const payload: WorkspaceInput = {
      name,
      description,
      address: location,
      membership,
      permission,
      createdBy: user._id,
      modifiedBy: user._id,
    };
    const { code, data, message } = await createWorkSpace(payload);
    console.log(
      '🚀 ~ file: workspace.controller.ts ~ line 43 ~ router.post ~ code, data, message',
      code,
      data,
      message
    );

    return res.send({ message: 'received' });
  } catch (error) {
    console.log(
      '🚀 ~ file: workspace.controller.ts ~ line 22 ~ router.post ~ error',
      error
    );
    return res.send({ message: 'received' });
  }
});
