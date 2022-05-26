import { FilterQuery, PopulateOptions } from 'mongoose';
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

export async function getUser(
  filter: FilterQuery<UserDocument>,
  populate: PopulateOptions | null
) {
  try {
    const query = userModel.findOne(filter);
    if (populate) {
      query.populate(populate);
    }
    const data = await query.exec();
    return { code: 200, data };
  } catch (err) {
    return { code: 500, data: null, err, message: 'Something went wrong' };
  }
}

export async function addWorkspaceUser(id: string, workspace: string) {
  try {
    const updUser = await userModel
      .findByIdAndUpdate(id, { $push: { workspaces: workspace } })
      .exec();

    return { code: 200, data: updUser };
  } catch (err) {
    console.log('errro  on p=joinin workspace');
    return { code: 500, data: null, message: 'Upadte user Went wrong' };
  }
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
