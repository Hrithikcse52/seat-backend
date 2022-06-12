import { Request, Response } from 'express';
import postModel from '../../models/post.model';

import { handleAPIError } from '../../utils/error.handler';

export async function getTrendingController(req: Request, res: Response) {
  try {
    const postsAg = await postModel
      .aggregate()
      .addFields({
        commentsCount: { $size: '$comments' },
      })
      .addFields({
        likesCount: { $size: '$likes' },
      })
      .sort({ likesCount: -1, commentsCount: -1 })
      .limit(3);
    console.log('pots trending', postsAg);
    await postModel.populate(postsAg, { path: 'createdBy', select: 'username name profileImg' });
    return res.send(postsAg);
  } catch (error) {
    console.log('errir ', error);
    return handleAPIError(res, error, 500, 'Something went Wrong');
  }
}
