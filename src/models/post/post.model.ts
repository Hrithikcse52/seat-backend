import { Schema, model } from 'mongoose';

interface Reaction {
  user:
    | {
        username: string;
        _id: Schema.Types.ObjectId;
      }
    | Schema.Types.ObjectId;
}

export interface PostInput {
  postDataHTML: string;
  postDataRaw: [];
  createdBy: Schema.Types.ObjectId;
}

export interface PostDocument extends PostInput, Document {
  likes: Reaction[];
  comments: Reaction[];
  createdAt: Date;
  updatedAt: Date;
}

const postSchema = new Schema({
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
      type: Schema.Types.ObjectId,
      ref: 'users',
    },
  ],
  created: {
    type: Date,
    default: Date.now,
  },
  updated: {
    type: Date,
    default: Date.now,
  },
});

postSchema.pre('save', function preSave(next) {
  this.modified = Date.now();
  next();
});

const postModel = model<PostDocument>('posts', postSchema);
export default postModel;
