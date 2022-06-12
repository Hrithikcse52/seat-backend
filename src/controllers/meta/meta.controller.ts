import { Request, Response } from 'express';
import { getUser } from '../../databaseQueries/user.queries';
import userModel from '../../models/user.model';
import { handleAPIError } from '../../utils/error.handler';

export async function getMetaProfile(req: Request, res: Response) {
  try {
    const { username } = req.params;
    if (!username) return handleAPIError(res, null, 400, 'username is not valid');
    const { code, data, ...rest } = await getUser(
      { username },
      null,
      'name username profileImg email workspace ogImage'
    );
    if (code !== 200) return handleAPIError(res, null, code, rest.message || 'user not found');
    return res.send(data);
  } catch (err) {
    return handleAPIError(res, err, 500, 'Something went wrong');
  }
}

export async function getIndexUsers(req: Request, res: Response) {
  const users = await userModel
    .find({}, 'name username profileImg email workspace ogImage')
    .limit(3)
    .sort({ createdAt: 1 });
  res.send(users);
}
