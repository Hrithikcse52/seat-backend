import { FilterQuery, PopulateOptions } from 'mongoose';
import workSpaceModel, { WorkspaceDocument, WorkspaceInput } from '../models/workspace/workspace.model';
import { DBQueries } from '../types/util.types';

export function createWorkSpace(doc: WorkspaceInput) {
  return new Promise<DBQueries<WorkspaceDocument>>((resolve, reject) => {
    console.log('doc ', doc);
    workSpaceModel.create(doc, (err, item) => {
      if (err || !item) {
        return reject({
          code: 500,
          message: 'error while creating workspace',
          data: err,
        });
      }
      return resolve({ code: 200, message: '', data: item });
    });
  });
}

export async function getAllWorkspace(filter: FilterQuery<WorkspaceDocument>) {
  try {
    console.log('filter', filter);
    const data = await workSpaceModel.find(filter).lean().exec();
    console.log('all workspace', data);
    return data;
  } catch (err) {
    console.log(err, 'fetch al ');
    return null;
  }
}
export async function addSpaceMember(id: string, user: string) {
  try {
    const updUser = await workSpaceModel.findByIdAndUpdate(id, { $push: { members: user } }).exec();
    return { code: 200, data: updUser };
  } catch (err) {
    console.log('errro  on p=joinin workspace');
    return { code: 500, data: null, message: 'Upadte user Went wrong' };
  }
}

export async function getWorkspace(filter: FilterQuery<WorkspaceDocument>, populate: PopulateOptions | null) {
  try {
    const query = workSpaceModel.findOne(filter);
    if (populate) {
      query.populate(populate);
    }
    const data = await query.lean().exec();
    return data;
  } catch (err) {
    console.log(err, 'fetch each');
    return null;
  }
}
