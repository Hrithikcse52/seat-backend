import { Schema, Types, model } from 'mongoose';

export interface ChatInput {
  sender: Types.ObjectId;
  receiver: Types.ObjectId;
  conversation: Types.ObjectId;
  message: string;
}

export interface ChatDocument extends ChatInput, Document {
  createdAt: Date;
}

const chatSchema = new Schema(
  {
    conversation: {
      type: Types.ObjectId,
      ref: 'conversations',
      required: true,
    },
    sender: {
      type: Types.ObjectId,
      ref: 'users',
      required: true,
    },
    receiver: {
      type: Types.ObjectId,
      ref: 'users',
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const chatModel = model<ChatDocument>('chats', chatSchema);
