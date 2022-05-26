import { Schema, model } from 'mongoose';

export interface BlogInput {
  blogDataHTML: string;
  blogDataRaw: [];
  workspace: string;
  createdBy: Schema.Types.ObjectId;
}

export interface BlogDocument extends BlogInput, Document {
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
  },
  { timestamps: true }
);

const blogModel = model<BlogDocument>('blogs', blogSchema);
export default blogModel;
