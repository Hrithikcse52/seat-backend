import { NextFunction, Response } from 'express';
import { isEqual } from 'lodash';
import { UserDocument } from '../models/user.model';
import workSpaceModel from '../models/workspace.model';
import { ReqMod } from '../types/util.types';
import { handleAPIError } from '../utils/error.handler';

export async function serializeWorkspace(req: ReqMod, res: Response, next: NextFunction) {
  try {
    const { workspace } = req.body || req.params;
    if (!workspace) return handleAPIError(res, null, 400, 'Workspace is not provided');
    const workspaceData = await workSpaceModel
      .findOne({ _id: workspace })
      .populate<{ members: UserDocument[] }>('members')
      .exec();

    if (!workspaceData) return handleAPIError(res, null, 400, 'Fetching wrsp went wrong!');

    req.workspaceData = workspaceData;

    return next();
  } catch (error) {
    return handleAPIError(res, error, 500, 'searilize wrksp went wrong');
  }
}

export async function hasAccesstoWorkspace(req: ReqMod, res: Response, next: NextFunction) {
  console.log('workspace has access check', req.user);
  try {
    const { user, workspaceData } = req;
    if (!user)
      return res.status(401).send({
        message: 'user dont have access to post on this space',
      });

    if (!workspaceData) return handleAPIError(res, null, 500, 'searilize wrksp went wrong');
    const { workspace } = req.body || req.params;

    if (!workspace)
      return res.status(400).send({
        message: 'Bad Reqest send workspace',
      });

    if (workspaceData.members.find((work) => isEqual(work._id, user._id))) return next();
    return res.status(401).send({
      message: 'user dont have access to post on this space',
    });
  } catch (error) {
    console.log('workspace middleware', error);
    return res.status(500).send({
      message: 'user dont have access to post on this space',
    });
  }
}
