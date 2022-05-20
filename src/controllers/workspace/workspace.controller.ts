import { Response, Router } from 'express';
import mongoose from 'mongoose';
import {
  createWorkSpace,
  getAllWorkspace,
  getWorkspace,
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
  const data = await getAllWorkspace({
    status: 'active',
    $or: [{ type: 'public' }, { type: 'approval_based' }],
  });
  console.log('data', data);
  return res.send(data);
});

router.post('/', isAuth, async (req: ReqMod, res) => {
  try {
    const { name, description, location, membership, type } = req.body;
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
    // TODO: Name should be unique do not run mongodb validation run self validation.
    const permission = [
      { user: user._id as mongoose.Schema.Types.ObjectId, role: 'admin' },
    ];
    const payload: WorkspaceInput = {
      name,
      description,
      type,
      address: location,
      // membership,
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

router.get('/:id', isAuth, async (req: ReqMod, res: Response) => {
  const { id } = req.params;
  console.log('id', id);
  const data = await getWorkspace({ _id: id });

  if (!data) {
    return res.status(500).send({ message: 'Something Went Wrong' });
  }
  // const responseData = {
  //   _id: data._id,
  //   name: data.name,
  //   description: data.description,
  //   address: data.address,
  //   type: data.type,
  // };
  return res.send(data);
});
