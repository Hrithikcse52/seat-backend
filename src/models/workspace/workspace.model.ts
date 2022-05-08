import { Schema, model } from 'mongoose';

const workSpaceSchema = new Schema(
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
    location: {
      type: String,
    },
    memberShip: {
      currency: String,
      amount: Number,
    },
    permissions: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: 'user',
          required: true,
        },
        role: {
          type: String,
          enum: ['admin', 'manager'],
          default: 'manager',
        },
      },
    ],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    modifiedBy: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
  },
  { timestamps: true }
);

// user -> library

const workSpaceModel = model('workspace', workSpaceSchema);
export default workSpaceModel;
