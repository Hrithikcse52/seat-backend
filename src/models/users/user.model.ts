import { Schema, model, Document } from 'mongoose';

export interface UserInput {
  email: {
    id: string;
  };
  name: {
    firstName: string;
    lastName: string;
  };
  phone: {
    number: number;
  };
  password: string;
}

export interface UserDocument
  extends Omit<UserInput, 'email' | 'phone'>,
    Document {
  email: { id: string; verified: boolean };
  phone: { number: number; vefified: boolean };
  tokenVersion: number;
  role: string;
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
      id: {
        type: String,
        unique: true,
        required: true,
      },
      verified: {
        type: Boolean,
        default: false,
      },
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
    role: {
      type: String,
      enum: ['user', 'manager', 'admin', 'super_admin'],
      default: 'user',
    },
  },
  { timestamps: true }
);

const userModel = model<UserDocument>('user', userSchema);
export default userModel;
