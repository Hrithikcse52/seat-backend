import { Response, Router, Request } from 'express';
import { ObjectId } from 'mongoose';
import {
  createWorkSpace,
  getAllWorkspace,
  getWorkspace,
} from '../../databaseQueries/workspace.queries';
import { ReqMod } from '../../types/util.types';
import { WorkspaceInput } from '../../models/workspace/workspace.model';
import { addWorkspaceUser } from '../../databaseQueries/user.queries';

export const router = Router();

export async function indexController(req: ReqMod, res: Response) {
  const { user } = req;
  if (!user) {
    return res.status(401).send({ user: null, message: 'Login' });
  }
  const data = await getAllWorkspace({ 'permission.user': user._id });
  return res.send(data);
}

export async function exploreData(_: Request, res: Response) {
  try {
    const data = await getAllWorkspace({
      status: 'active',
      $or: [{ type: 'public' }, { type: 'approval_based' }],
    });
    console.log('data', data);
    return res.send(data);
  } catch (error) {
    return res.status(500).send({ message: 'something went wrong', error });
  }
}

export async function createController(req: ReqMod, res: Response) {
  try {
    const { name, description, location, type } = req.body;
    const { user } = req;

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
}

export async function getWorkspaceController(req: ReqMod, res: Response) {
  const { id } = req.params;
  console.log('id', id);
  const data = await getWorkspace(
    { _id: id },
    { path: 'permission.user', select: 'name email' }
  );
  // TODO://Filter data to be sent
  if (!data) {
    return res.status(500).send({ message: 'Something Went Wrong' });
  }

  return res.send(data);
}

export async function workspaceJoinController(req: ReqMod, res: Response) {
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
}
