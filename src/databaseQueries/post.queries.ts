import { FilterQuery, UpdateQuery, PopulateOptions } from 'mongoose';
import postModel, { PostDocument, PostInput } from '../models/post/post.model';

export async function createPost(doc: PostInput) {
  try {
    if (!doc) return { code: 400, message: 'Invalid Query', data: null };
    const newPost = await postModel.create(doc);
    console.log('newPost Created', newPost);
    return { code: 200, data: newPost };
  } catch (error) {
    console.log('creating Post errir', error);
    return { code: 500, message: 'Something went Wrong', data: null };
  }
}

export async function getPost(filter: FilterQuery<PostDocument>, populate: PopulateOptions[] | PopulateOptions | null) {
  try {
    const query = postModel.find(filter).sort({ createdAt: -1 });
    if (populate) {
      if (Array.isArray(populate)) populate.forEach((popu) => query.populate(popu));
      else query.populate(populate);
    }
    const post = await query.sort({ created: -1 }).exec();
    return { code: 200, data: post };
  } catch (error) {
    console.log('🚀 ~ file: Post.queries.ts ~ line 22 ~ getPost ~ error', error);
    return { code: 500, message: 'Something went Wrong', data: null };
  }
}

export async function addReaction(id: string, update: UpdateQuery<PostDocument>) {
  try {
    const post = postModel.findByIdAndUpdate(id, update, { new: true }).exec();
    return { code: 200, data: post };
  } catch (error) {
    console.log('🚀 ~ file: Post.queries.ts ~ line 34~ update ~ error', error);
    return { code: 500, message: 'Something went Wrong', data: null };
  }
}
