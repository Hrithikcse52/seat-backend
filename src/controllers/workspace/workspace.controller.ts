import { Response, Router, Request } from 'express';
import { ObjectId } from 'mongoose';
import { isEqual } from 'lodash';
import {
  addSpaceMember,
  createWorkSpace,
  getAllWorkspace,
  getWorkspace,
} from '../../databaseQueries/workspace.queries';
import { ReqMod } from '../../types/util.types';
import workSpaceModel, { WorkspaceInput } from '../../models/workspace.model';
import { handleAPIError } from '../../utils/error.handler';

export const router = Router();

export async function indexController(req: ReqMod, res: Response) {
  const { user } = req;
  if (!user) {
    return res.status(401).send({ user: null, message: 'Login' });
  }
  const data = await getAllWorkspace({ createdBy: user._id });
  return res.send(data);
}

export async function exploreData(_: Request, res: Response) {
  try {
    const data = await workSpaceModel
      .find({ status: 'active', $or: [{ type: 'public' }, { type: 'approval_based' }] })
      .populate('members', 'name email profileImg username');
    // const data = await getAllWorkspace({
    //   status: 'active',
    //   $or: [{ type: 'public' }, { type: 'approval_based' }],
    // });
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
    const payload: WorkspaceInput = {
      name,
      description,
      type,
      address: location,
      // membership,
      members: user._id,
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
    console.error('🚀 ~ file: workspace.controller.ts ~ line 22 ~ router.post ~ error', error);
    return res.send({ message: 'received' });
  }
}

export async function getWorkspaceController(req: ReqMod, res: Response) {
  const { id } = req.params;
  // const data = await getWorkspace({ _id: id }, { path: 'permission.user', select: 'name email' });
  const data = await workSpaceModel
    .findOne({ _id: id })
    .populate({ path: 'members', select: 'name email profileImg username' })
    .exec();
  console.log('🚀 ~ file: workspace.controller.ts ~ line 81 ~ getWorkspaceController ~ data', data);

  // TODO://Filter data to be sent
  if (!data) {
    return res.status(500).send({ message: 'Something Went Wrong' });
  }

  return res.send(data);
}

export async function workspaceJoinController(req: ReqMod, res: Response) {
  try {
    const { workspace, role = 'user' }: { workspace: string; role?: string } = req.body;
    const { user, workspaceData } = req;
    if (!user) {
      return res.status(401).send({ message: 'Do Login to join a space' });
    }
    if (!workspaceData) return handleAPIError(res, null, 500, 'searilize wrksp went wrong');

    if (workspaceData.members.find((mem) => isEqual(mem._id, user._id))) {
      console.log('already a member');
      return res.status(409).send({ message: 'already a memeber' });
    }

    // if (workspaceData.permission.find((per) => isEqual(per.user, user._id))) {
    //   console.log('already a mgmt member');
    //   return handleAPIError(res, null, 409, 'already a management member');
    // }

    if (role === 'user') {
      const { code, data, ...restData } = await addSpaceMember(workspace, user._id);
      // const { code, data, ...restData } = await addWorkspaceUser(user._id, workspace);
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
