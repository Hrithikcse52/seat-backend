import { Schema, model, Document } from 'mongoose';

export interface UserInput {
  email: string;
  name: {
    firstName: string;
    lastName: string;
  };
  phone: {
    number: number;
    verified?: boolean;
  };

  password: string;
}

export interface UserDocument extends UserInput, Document {
  tokenVersion: number;
  createdAt: Date;
  updatedAt: Date;
}

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
      number: {
        type: Number,
        unique: true,
      },
      verified: {
        type: Boolean,
        default: false,
      },
    },
    tokenVersion: {
      type: Number,
      default: 0,
    },
    password: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const userModel = model<UserDocument>('user', userSchema);
export default userModel;
