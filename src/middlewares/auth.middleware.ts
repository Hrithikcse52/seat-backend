import { NextFunction, Response } from 'express';
import { verify } from 'jsonwebtoken';
import { ACCESS_TOKEN_SECRET } from '../config';
import { getUser } from '../databaseQueries/user.queries';
import { AccessTokenPayload } from '../types/token.types';
import { ReqMod } from '../types/util.types';

export async function isAuth(req: ReqMod, res: Response, next: NextFunction) {
  const access = req.cookies.access || req.headers['x-access-token'];
  const refresh = req.cookies.refresh || req.headers['x-refresh-token'];
  if (!access && refresh) {
    // Refresh the tokens
    return res.status(403).send({ user: null });
  }
  if (!(access && refresh)) {
    // Dont refresh the tokens
    return res.status(401).send({ message: 'do login' });
  }
  try {
    const user = verify(access, ACCESS_TOKEN_SECRET as string) as AccessTokenPayload;
    if (!user) {
      return res.status(401).send({ user: null, message: 'invalid token' });
    }
    const {
      code,
      data: userData,
      message,
    } = await getUser({ _id: user.userId }, { path: 'workspaces', select: 'name' });
    if (code !== 200 || !userData || Array.isArray(userData)) {
      return res.status(code).send({ user: null, message });
    }

    req.user = userData;
    return next();
  } catch (error) {
    return res.status(500).send({ user: null, message: 'Something went wrong!' });
  }
}

// use this after is auth
export async function isAdmin(req: ReqMod, res: Response, next: NextFunction) {
  const { user } = req;
  if (!user) {
    console.log('is admin middle ware');
    return res.status(401).send({ user: null, message: 'forbidden' });
  }
  try {
    if (user.role !== 'admin') {
      console.log('user is not admin');
      return res.status(401).send({ user: null, message: 'forbidden place' });
    }
    return next();
  } catch (error) {
    console.log('error in isAdmin', error);
    return res.status(500).send({ user: null, message: 'Something went wrong!' });
  }
}

// eslint-disable-next-line consistent-return
export function handleUser(req: ReqMod, res: Response) {
  if (!req.user) {
    return res.status(401).send({ user: null, message: 'do login' });
  }
}

export async function isManager(req: ReqMod, res: Response, next: NextFunction) {
  const { user } = req;
  if (!user) {
    console.log('ismanager middle ware');
    return res.status(401).send({ user: null, message: 'forbidden' });
  }
  try {
    if (user.role !== 'manager') {
      console.log('user is not manager');
      return res.status(401).send({ user: null, message: 'forbidden place' });
    }
    return next();
  } catch (error) {
    console.log('error in isManager', error);
    return res.status(500).send({ user: null, message: 'Something went wrong!' });
  }
}

export async function isManagerOrAdmin(req: ReqMod, res: Response, next: NextFunction) {
  const { user } = req;
  if (!user) {
    console.log('isManagerOradmin middle ware');
    return res.status(401).send({ user: null, message: 'forbidden' });
  }
  try {
    if (user.role === 'manager' || user.role === 'admin') {
      console.log('user is not manager or admin');
      return res.status(401).send({ user: null, message: 'forbidden place' });
    }
    return next();
  } catch (error) {
    console.log('error in isManagerOradmin', error);
    return res.status(500).send({ user: null, message: 'Something went wrong!' });
  }
}
