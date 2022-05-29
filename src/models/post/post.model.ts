import { Schema, model } from 'mongoose';

interface Reaction {
  user:
    | {
        username: string;
        _id: Schema.Types.ObjectId;
      }
    | Schema.Types.ObjectId;
}
interface ReactionComment {
  user:
    | {
        username: string;
        _id: Schema.Types.ObjectId;
      }
    | Schema.Types.ObjectId;
  message: string;
}

export interface PostInput {
  postDataHTML: string;
  postDataRaw: [];
  createdBy: Schema.Types.ObjectId;
}

export interface PostDocument extends PostInput, Document {
  likes: Reaction[];
  comments: ReactionComment[];
  createdAt: Date;
  updatedAt: Date;
}

const postSchema = new Schema(
  {
    postDataHTML: {
      type: String,
    },
    postDataRaw: {
      type: [],
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'users',
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

const postModel = model<PostDocument>('posts', postSchema);
export default postModel;
