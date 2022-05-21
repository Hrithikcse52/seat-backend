import { Schema, model, Document } from 'mongoose';
import { WorkspaceDocument } from '../workspace/workspace.model';

export interface UserInput {
  email: string;
  name: {
    firstName: string;
    lastName: string;
  };
  phone: string;
  password: string;
}

export interface UserDocument extends UserInput, Document {
  workspaces: Array<WorkspaceDocument | WorkspaceDocument['_id']>;
  status: string;
  tokenVersion: number;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}
// status :{ phone :false,email:false}

const userSchema = new Schema(
  {
    name: {
      firstName: {
        type: String,
      },
      lastName: {
        type: String,
      },
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    phone: {
      type: String,
      unique: true,
      required: true,
    },
    tokenVersion: {
      type: Number,
      default: 0,
    },
    password: {
      type: String,
      required: true,
    },
    workspaces: [
      {
        type: Schema.Types.ObjectId,
        ref: 'workspaces',
      },
    ],
    status: {
      type: String,
      enum: [
        'active',
        'email_not_verified',
        'phone_not_verified',
        'not_verified',
      ],
      default: 'not_verified',
    },
    role: {
      type: String,
      enum: ['user', 'manager', 'admin', 'super_admin'],
      default: 'user',
    },
  },
  { timestamps: true }
);

const userModel = model<UserDocument>('users', userSchema);
export default userModel;
