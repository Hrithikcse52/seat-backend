import { Schema, model, Document } from 'mongoose';
import { UserDocument } from './user.model';

// interface PermType {
//   user:
//     | {
//         name: {
//           firstName: string;
//           lastName: string;
//         };
//         email: string;
//         _id: string;
//       }
//     | Schema.Types.ObjectId;
//   role: string;
// }

export interface WorkspaceInput {
  name: string;
  description: string;
  address: string;
  // membership?: {
  //   amount: number;
  //   currenct: string;
  // };
  members: Schema.Types.ObjectId[];
  type: string;
  // permission: PermType[];
  createdBy: Schema.Types.ObjectId;
  modifiedBy: Schema.Types.ObjectId;
}

export interface WorkspaceDocument extends WorkspaceInput, Document {
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
//

const workSpaceSchema = new Schema<WorkspaceDocument>(
  {
    name: {
      type: String,
      minlength: [3, 'Must be over 2 characters long'],
      maxlength: [45, 'Must be under 46 characters long'],
      required: true,
    },
    description: {
      type: String,
      minlength: [5, 'Must be over 4 characters long'],
      maxlength: [300, 'Must be under 300 characters long'],
      required: true,
    },
    address: {
      type: String,
    },
    type: {
      type: String,
      enum: ['public', 'invite_only', 'approval_based'],
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'email_not_verified', 'phone_not_verified', 'not_verified'],
      default: 'not_verified',
    },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: 'users',
      },
    ],
    // membership: {
    //   amount: Number,
    //   currency: String,
    // },
    // permission: [
    //   {
    //     user: {
    //       type: Schema.Types.ObjectId,
    //       ref: 'users',
    //       required: true,
    //     },
    //     role: {
    //       type: String,
    //       enum: ['admin', 'manager'],
    //       default: 'manager',
    //     },
    //   },
    // ],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'users',
      required: true,
    },
    modifiedBy: {
      type: Schema.Types.ObjectId,
      ref: 'users',
      required: true,
    },
  },
  { timestamps: true }
);

// user -> library

const workSpaceModel = model<WorkspaceDocument>('workspaces', workSpaceSchema);
export default workSpaceModel;
