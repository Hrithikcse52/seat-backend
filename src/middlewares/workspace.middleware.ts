import { NextFunction, Response } from 'express';
import { ReqMod } from '../types/util.types';

export async function hasAccesstoWorkspace(req: ReqMod, res: Response, next: NextFunction) {
  console.log('workspace has access check', req.user);
  try {
    const { user } = req;
    if (!user)
      return res.status(401).send({
        message: 'user dont have access to post on this space',
      });
    const { workspace } = req.body || req.params;

    if (!workspace)
      return res.status(400).send({
        message: 'Bad Reqest send workspace',
      });

    console.log('workspace', workspace, user.workspaces);

    if (user.workspaces.find((work) => work._id.toString() === workspace)) return next();
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
