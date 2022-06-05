import { Response } from 'express';
import { UpdateQuery, FilterQuery } from 'mongoose';
import { addBlogReaction, createBlog, getBlog } from '../../databaseQueries/blog.queries';
import { BlogDocument } from '../../models/blog.model';
import { ReqMod } from '../../types/util.types';
import { handleAPIError } from '../../utils/error.handler';

export async function createBlogController(req: ReqMod, res: Response) {
  try {
    const { user } = req;
    if (!user) return res.send({ message: 'Do login' });
    const { raw, html, workspace } = req.body;
    const { code, data, ...restData } = await createBlog({
      blogDataHTML: html,
      blogDataRaw: raw,
      workspace,
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

export async function blogIndexController(req: ReqMod, res: Response) {
  try {
    const { workspace } = req.body;
    const { code, data, ...rest } = await getBlog({ workspace }, [
      { path: 'createdBy', select: 'name email username profileImg' },
      { path: 'comments.user', select: 'username name profileImg' },
      { path: 'likes', select: 'username name profileImg' },
    ]);
    if (code !== 200 || !data) {
      return res.status(code).send({ message: rest.message || 'something went wring' });
    }
    return res.send(data);
  } catch (error) {
    console.log('🚀 ~ file: blog.controller.ts ~ line 40 ~ index ~ error', error);

    return res.status(500).send({ message: 'something went wring', error: JSON.stringify(error) });
  }
}

export async function blogReactionController(req: ReqMod, res: Response) {
  const { user } = req;
  if (!user) return handleAPIError(res, null, 401, 'user not auth');
  const { blogId, action, message } = req.body;
  if (!blogId) return handleAPIError(res, null, 400, 'Invalid Query');
  const payload: UpdateQuery<BlogDocument> = {};
  payload.$push = {};
  if (action === 'like') {
    payload.$push = {
      likes: user._id,
    };
  } else {
    payload.$push = {
      comments: { user: user._id, message },
    };
  }
  console.log('payload ', payload);
  const { code, data, ...rest } = await addBlogReaction(blogId, payload);
  if (code !== 200 || !data) {
    return handleAPIError(res, null, code, rest.message || 'something went wrong');
  }
  return res.send(data);
}
