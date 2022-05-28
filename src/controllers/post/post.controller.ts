import { Response } from 'express';
import { createPost, getPost } from '../../databaseQueries/post.queries';
import { ReqMod } from '../../types/util.types';

export async function create(req: ReqMod, res: Response) {
  try {
    const { user } = req;
    if (!user) return res.send({ message: 'Do login' });
    const { raw, html, workspace } = req.body;
    const { code, data, ...restData } = await createPost({
      postDataHTML: html,
      postDataRaw: raw,
      createdBy: user._id,
    });
    if (code !== 200) {
      return res.status(code).send({ message: restData.message || 'something went wrong' });
    }
    return res.send(data);
  } catch (error) {
    return res.status(500).send({ message: 'something went wrong', error: JSON.stringify(error) });
  }
}

export async function index(req: ReqMod, res: Response) {
  try {
    const { code, data, ...rest } = await getPost({}, { path: 'createdBy', select: 'username' });
    if (code !== 200 || !data) {
      return res.status(code).send({ message: rest.message || 'something went wring' });
    }
    return res.send(data);
  } catch (error) {
    console.log('🚀 ~ file: Post.controller.ts ~ line 40 ~ index ~ error', error);
    return res.status(500).send({ message: 'something went wring', error: JSON.stringify(error) });
  }
}
