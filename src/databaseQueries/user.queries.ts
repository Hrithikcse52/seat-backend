import { FilterQuery } from 'mongoose';
import userModel, { UserDocument, UserInput } from '../models/users/user.model';

export interface UserQueries {
  code: number;
  message: string;
  data: UserDocument | null;
}

export function createUser(doc: UserInput) {
  return new Promise<UserQueries>((resolve, reject) => {
    userModel.create(doc, (err, item) => {
      if (err || !item) {
        return reject({
          code: 500,
          message: 'error while creating user',
          data: err,
        });
      }
      return resolve({ code: 200, message: '', data: item });
    });
  });
}

export function getUser(filter: FilterQuery<UserDocument>, options = {}) {
  return new Promise<UserQueries>((resolve, reject) => {
    userModel.findOne(filter, '', options, (err, item) => {
      if (err || !item) {
        return reject({
          code: 500,
          message: 'error while fetching user',
          data: err,
        });
      }
      return resolve({ code: 200, message: '', data: item });
    });
  });
}

export function incTokenVersion(_id: { _id: string }) {
  return new Promise<UserQueries>((resolve, reject) => {
    userModel.findByIdAndUpdate(
      _id,
      { $inc: { tokenVersion: 1 } },
      { new: true },
      (err, item) => {
        if (err || !item) {
          return reject({
            code: 500,
            message: 'error while updating user',
            data: err,
          });
        }
        return resolve({ code: 200, message: '', data: item });
      }
    );
  });
}
