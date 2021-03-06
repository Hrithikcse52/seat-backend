import { FilterQuery, UpdateQuery, PopulateOptions } from 'mongoose';

import blogModel, { BlogDocument, BlogInput } from '../models/blog.model';

export async function createBlog(doc: BlogInput) {
  try {
    if (!doc) return { code: 400, message: 'Invalid Query', data: null };
    const newBlog = await blogModel.create(doc);
    console.log('newBlog Created', newBlog);
    return { code: 200, data: newBlog };
  } catch (error) {
    console.log('creating blog errir', error);
    return { code: 500, message: 'Something went Wrong', data: null };
  }
}

export async function getBlog(filter: FilterQuery<BlogDocument>, populate: PopulateOptions | PopulateOptions[] | null) {
  try {
    const query = blogModel.find(filter).sort({ createdAt: -1 });
    if (populate) query.populate(populate);
    const blogs = await query.exec();
    return { code: 200, data: blogs };
  } catch (error) {
    console.log('🚀 ~ file: blog.queries.ts ~ line 22 ~ getBlog ~ error', error);
    return { code: 500, message: 'Something went Wrong', data: null };
  }
}

export async function addBlogReaction(id: string, update: UpdateQuery<BlogDocument>) {
  try {
    const post = blogModel.findByIdAndUpdate(id, update, { new: true }).exec();
    return { code: 200, data: post };
  } catch (error) {
    console.log('🚀 ~ file: Post.queries.ts ~ line 34~ update ~ error', error);
    return { code: 500, message: 'Something went Wrong', data: null };
  }
}
