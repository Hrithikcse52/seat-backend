import { Request } from 'express';
import { UserDocument } from '../models/user.model';
import { WorkspaceDocument } from '../models/workspace.model';

export interface ReqMod extends Request {
  workspaceData?:
    | Omit<WorkspaceDocument, 'members'> & {
        members: UserDocument[];
      };
  user?: UserDocument;
}

export interface DBQueries<T> {
  code: number;
  message: string;
  data: T | null;
}
