import { Schema, Types, model } from 'mongoose';

export interface ConversationInput {
  participants: [];
}

export interface ConversationDocument extends ConversationInput, Document {
  createdAt: Date;
}

const conversationSchema = new Schema(
  {
    participants: [
      {
        type: Types.ObjectId,
        ref: 'users',
      },
    ],
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const conversationModel = model<ConversationDocument>('conversations', conversationSchema);
