import { Response, Router } from 'express';
import { ObjectId } from 'mongoose';
import {
  createWorkSpace,
  getAllWorkspace,
  getWorkspace,
} from '../../databaseQueries/workspace.queries';
import { isAuth } from '../../middlewares/auth.middleware';
import { ReqMod } from '../../types/util.types';
import { WorkspaceInput } from '../../models/workspace/workspace.model';
import { addWorkspaceUser } from '../../databaseQueries/user.queries';

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
    const permission = [{ user: user._id as ObjectId, role: 'admin' }];
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
  const data = await getWorkspace(
    { _id: id },
    { path: 'permission.user', select: 'name email' }
  );

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

router.post('/join', isAuth, async (req: ReqMod, res: Response) => {
  try {
    const { workspace, role = 'user' }: { workspace: string; role?: string } =
      req.body;
    const { user } = req;
    if (!user) {
      return res.status(401).send({ message: 'Do Login to join a space' });
    }
    if (
      user.workspaces &&
      user.workspaces.find((space) => space.toString() === workspace)
    ) {
      console.log('already a memner');
      return res.status(409).send({ message: 'already a memeber' });
    }
    const workspaceDetails = await getWorkspace({ _id: workspace }, null);
    // check for user is already a admin or manager for that workspace
    if (!workspaceDetails) {
      return res.status(500).send({ message: 'no workspace found' });
    }
    console.log('workspace deata', workspaceDetails.permission, workspace);

    if (
      workspaceDetails.permission.find(
        (usr) => usr.user.toString() === user._id.toString()
      )
    ) {
      return res.status(409).send({ message: 'already a management member' });
    }

    if (role === 'user') {
      const { code, data, ...restData } = await addWorkspaceUser(
        user._id,
        workspace
      );
      if (code !== 200) {
        return res.status(code).send({ message: restData.message });
      }
      return res.send({ message: 'workspace/ space Added' });
    }
    return res.status(500).send({ message: 'on maintenance' });

    // validate user of already joinned!!
  } catch (err) {
    return res.status(401).send({ message: 'Something Went Wrong' });
  }
});
