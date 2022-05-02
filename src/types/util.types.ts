import { Request } from 'express';
import { UserDocument } from '../models/users/user.model';

export interface ReqMod extends Request {
  user?: UserDocument;
}
