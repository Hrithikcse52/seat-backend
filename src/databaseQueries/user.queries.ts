import { rejects } from 'assert';
import { resolve } from 'path';
import userModel, { UserDocument, UserInput } from '../models/users/user.model';

export interface userQueries {
  code: number;
  message: string;
  data: UserDocument | null;
}

export function createUser(doc: UserInput) {
  return new Promise<userQueries>((resolve, reject) => {
    if (!doc) {
      reject({ code: 400, message: 'user input', data: null });
    }
    userModel.create(doc, (err, item) => {
      if (err || !item) {
        reject({ code: 500, message: 'error while creating user', data: err });
      }
      resolve({ code: 200, message: '', data: item });
    });
  });
}

export function getUser(filter: {}, options = {}) {
  return new Promise<userQueries>((resolve, reject) => {
    userModel.findOne(filter, '', options, (err, item) => {
      if (err || !item) {
        reject({ code: 500, message: 'error while fetching user', data: err });
      }
      resolve({ code: 200, message: '', data: item });
    });
  });
}

export function incTokenVersion(id: { id: string }) {
  return new Promise<userQueries>((resolve, reject) => {
    userModel.findByIdAndUpdate(
      id,
      { $inc: { tokenVersion: 1 } },
      (err, item) => {
        if (err || !item) {
          reject({
            code: 500,
            message: 'error while updating user',
            data: err,
          });
        }
        resolve({ code: 200, message: '', data: item });
      }
    );
  });
}
