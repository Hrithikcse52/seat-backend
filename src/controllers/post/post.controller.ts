import { Response } from 'express';
import { UpdateQuery, FilterQuery } from 'mongoose';
import { addReaction, createPost, getPost } from '../../databaseQueries/post.queries';
import { PostDocument } from '../../models/post.model';
import { ReqMod } from '../../types/util.types';
import { handleAPIError } from '../../utils/error.handler';

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
    const { postid } = req.params;
    const filter: FilterQuery<PostDocument> = {};
    if (postid) {
      filter._id = postid;
    }
    console.log('filters', postid);
    const { code, data, ...rest } = await getPost(filter, [
      { path: 'createdBy', select: 'username name profileImg' },
      { path: 'comments.user', select: 'username name profileImg' },
      { path: 'likes', select: 'username name profileImg' },
    ]);
    if (code !== 200 || !data) {
      return res.status(code).send({ message: rest.message || 'something went wring' });
    }
    if (data.length === 1) {
      return res.send(data[0]);
    }
    return res.send(data);
  } catch (error) {
    console.log('🚀 ~ file: Post.controller.ts ~ line 40 ~ index ~ error', error);
    return res.status(500).send({ message: 'something went wring', error: JSON.stringify(error) });
  }
}

export async function addLikeComment(req: ReqMod, res: Response) {
  const { user } = req;
  if (!user) return handleAPIError(res, null, 401, 'user not auth');
  const { postId, action, message } = req.body;
  if (!postId) return handleAPIError(res, null, 400, 'Invalid Query');
  const payload: UpdateQuery<PostDocument> = {};
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
  const { code, data, ...rest } = await addReaction(postId, payload);
  if (code !== 200 || !data) {
    return handleAPIError(res, null, code, rest.message || 'something went wrong');
  }
  return res.send(data);
}
