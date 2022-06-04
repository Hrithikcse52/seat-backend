import { FilterQuery, PopulateOptions, UpdateQuery } from 'mongoose';
import userModel, { UserDocument, UserInput } from '../models/users/user.model';

export interface UserQueries {
  code: number;
  message: string;
  data: UserDocument | null;
}

export function createUser(doc: UserInput) {
  return new Promise<UserQueries>((resolve, reject) => {
    console.log('doc ', doc);
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

// export function getUser(filter: FilterQuery<UserDocument>, options = {}) {
//   return new Promise<UserQueries>((resolve, reject) => {
//     userModel.findOne(filter, '', options, (err, item) => {
//       if (err || !item) {
//         return reject({
//           code: 500,
//           message: 'error while fetching user',
//           data: err,
//         });
//       }
//       return resolve({ code: 200, message: '', data: item });
//     });
//   });
// }

export async function updateUser(id: string, update: UpdateQuery<UserDocument>) {
  try {
    const user = await userModel.findByIdAndUpdate(id, update, { new: true }).exec();
    if (!user) {
      return { code: 501, message: 'update error db' };
    }
    return { code: 200, data: user };
  } catch (err) {
    return {
      code: 501,
      message: 'update error db',
      error: JSON.stringify(err),
    };
  }
}

export async function getUser(
  filter: FilterQuery<UserDocument>,
  populate: PopulateOptions | null = null,
  select: string | null = null
) {
  try {
    const query = userModel.find(filter);
    if (populate) {
      query.populate(populate);
    }
    if (select) {
      query.select(select);
    }
    const data = await query.exec();
    console.log('data user', data);
    if (data && data.length === 0) return { code: 206, data: null };

    return { code: 200, data: data[0] };
  } catch (err) {
    return { code: 500, data: null, err, message: 'Something went wrong' };
  }
}

export function incTokenVersion(_id: { _id: string }) {
  return new Promise<UserQueries>((resolve, reject) => {
    userModel.findByIdAndUpdate(_id, { $inc: { tokenVersion: 1 } }, { new: true }, (err, item) => {
      if (err || !item) {
        return reject({
          code: 500,
          message: 'error while updating user',
          data: err,
        });
      }
      return resolve({ code: 200, message: '', data: item });
    });
  });
}
