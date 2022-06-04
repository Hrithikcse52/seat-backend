import { Schema, model } from 'mongoose';
import { Reaction, ReactionComment } from '../post/post.model';

export interface BlogInput {
  blogDataHTML: string;
  blogDataRaw: [];
  workspace: string;
  createdBy: Schema.Types.ObjectId;
}

export interface BlogDocument extends BlogInput, Document {
  likes: Reaction[];
  comments: ReactionComment[];
  createdAt: Date;
  updatedAt: Date;
}

const blogSchema = new Schema(
  {
    blogDataHTML: {
      type: String,
    },
    blogDataRaw: {
      type: [],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'users',
    },
    workspace: {
      type: Schema.Types.ObjectId,
      ref: 'workspaces',
    },
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'users',
      },
    ],
    comments: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: 'users',
        },
        message: {
          type: String,
        },
      },
    ],
  },
  { timestamps: true }
);

const blogModel = model<BlogDocument>('blogs', blogSchema);
export default blogModel;
