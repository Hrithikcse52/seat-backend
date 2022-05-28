import { Request, Response } from 'express';
import { hash, compare } from 'bcrypt';
import fs from 'fs';
import { verify } from 'jsonwebtoken';
import { FRONT_END_URL, REFRESH_TOKEN_SECRET } from '../../config';
import { createUser, getUser, incTokenVersion, updateUser } from '../../databaseQueries/user.queries';
import { clearTokens, buildTokens, setTokens } from '../../utils/token.utils';
import { RefreshTokenPayload } from '../../types/token.types';
import { ReqMod } from '../../types/util.types';
import { uploadImage } from '../../lib/supabase.lib';
import { handleAPIError } from '../../utils/error.handler';

export async function registerHandler(req: Request, res: Response) {
  try {
    const { firstName, lastName, email, username, password, phone, profileImg } = req.body;
    if (!(firstName && lastName && email && password && phone)) {
      return res.status(400).send({ message: 'improper query', data: null });
    }
    const encryptPass = await hash(password, 10);
    const {
      code,
      data: user,
      message,
    } = await createUser({
      email,
      username,
      name: {
        firstName,
        lastName,
      },
      profileImg,
      phone,

      password: encryptPass,
    });
    console.log(code, user, message, 'user 35');
    if (code !== 200) {
      return res.status(code).send({ message, data: user });
    }
    return res.send(user);
  } catch (error) {
    console.log('error while creating user, user controller line 35', error);
    return res.status(500).send({ message: 'something went wrong', data: error });
  }
}

export async function editUserController(req: ReqMod, res: Response) {
  try {
    console.log('req', req.body, req.headers, req.files, req.file);
    const { user, file } = req;
    if (!user) {
      return res.status(500).send({ message: 'user Error' });
    }
    const { firstName, lastName, email, username } = req.body;
    const updateDoc: {
      name?: {
        firstName?: string;
        lastName?: string;
      };
      email?: string;
      username?: string;
      profileImg?: string;
    } = {};
    if (file && user) {
      const newFile = fs.readFileSync(file.path);
      console.log('file', newFile);
      const { data, error } = await uploadImage('seat', `user/${user._id}/`, file.filename, file, newFile);
      console.log('data', data, error);
      if (!data || error) {
        return res.status(500).send({ message: 'Something went Wring', error });
      }
      updateDoc.profileImg = data.publicURL;
    }
    if (firstName || lastName) {
      updateDoc.name = {};
      if (firstName) {
        updateDoc.name.firstName = firstName;
      }
      if (lastName) {
        updateDoc.name.lastName = lastName;
      }
    }
    // TODO://Check for unique emails

    if (username) {
      updateDoc.username = username;
    }
    if (email) {
      updateDoc.email = email;
    }
    const { code: upCode, data: newUser, ...rest } = await updateUser(user._id, updateDoc);

    if (upCode !== 200) return res.status(upCode).send({ message: rest.message || 'somethng went wring' });

    return res.send(newUser);
  } catch (error) {
    console.log('err86', error);
    return res.status(501).send({ message: 'Ressc', error: JSON.stringify(error) });
  } finally {
    if (req.file) fs.unlinkSync(req.file.path);
  }
}

export function logoutHandler(req: Request, res: Response) {
  clearTokens(res);
  res.status(201).send({ user: null });
}

export async function userNameValidator(req: Request, res: Response) {
  try {
    const { username } = req.body;
    if (!username) {
      return handleAPIError(res, null, 400, 'invalid Query handler');
    }
    const { code } = await getUser({ username }, null);
    if (code !== 206) {
      return handleAPIError(res, null, 409, 'user with username already present');
    }
    return res.send({ message: 'username is availiable' });
  } catch (error) {
    console.log('error in usernam', error);
    return handleAPIError(res, error);
  }
}

export async function loginController(req: Request, res: Response) {
  try {
    const { emailOrusername, password } = req.body;
    console.log('login body', req.body);
    if (!(emailOrusername && password)) {
      return res.status(400).send({ message: 'improper query', data: null });
    }
    console.log('usernmae', emailOrusername);
    const {
      code,
      data: user,
      message,
    } = await getUser({ $or: [{ email: emailOrusername }, { username: emailOrusername }] }, null);
    if (code !== 200 || !user || Array.isArray(user)) {
      return res.status(code).send({ message, data: null });
    }

    console.log(code, user, message, 'user 54');
    const passMatch = await compare(password, user.password);
    console.log('match ', passMatch);
    if (passMatch) {
      const { accessToken, refreshToken } = buildTokens(user);
      console.log('called token creattion', accessToken, refreshToken);
      setTokens(res, accessToken, refreshToken);
      return res.send({
        id: user._id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        username: user.username,
        profileImg: user.profileImg,
        // accessToken,
        // refreshToken,
      });
      // res.redirect(`${FRONT_END_URL}`);
      // res.send({ message: 'logged in' });
    }
    console.log('not user ');
    return res.redirect(`${FRONT_END_URL}`);
  } catch (error) {
    console.log('error while logging user, user controller line 49', error);
    return res.status(500).send({ message: 'something went wrong', data: error });
  }
}

function handleRefreshError(res: Response, status: number, message: string) {
  clearTokens(res);
  return res.status(status).send({ message });
}

export async function refreshController(req: Request, res: Response) {
  try {
    const { refresh } = req.cookies || req.headers['x-refresh-token'];
    // if (!refresh) return res.status(401).send({ message: 'unauthorized' });
    if (!refresh) return handleRefreshError(res, 401, 'unauthoized');
    const user = verify(refresh, REFRESH_TOKEN_SECRET as string) as RefreshTokenPayload;
    console.log('refresh', user);
    // desearelize the token
    const { data: userData } = await getUser({ _id: user.userId }, null);
    console.log('user data', userData);
    // if (!userData) return res.status(404).send({ message: 'user not found' });
    if (!userData || Array.isArray(userData)) return handleRefreshError(res, 404, 'user not found');
    // check if the version of token matches the prev refresh token

    if (user.version !== userData?.tokenVersion) {
      // return res.status(401).send({ message: 'token is expired relogin' });
      return handleRefreshError(res, 401, 'expired relogin');
    }
    console.log("token's version is same inctoken version and create new token");

    const { data: newUser } = await incTokenVersion({ _id: user.userId });
    console.log('new user version update', newUser);
    if (!newUser)
      // return res.status(500).send({ message: 'token update failed' });
      return handleRefreshError(res, 500, 'token update failed');

    const { accessToken, refreshToken } = buildTokens(newUser);
    console.log('called token creattion', accessToken, refreshToken);
    setTokens(res, accessToken, refreshToken);
    return res.send({ message: 'done' });
  } catch (error) {
    console.log('error on refresh token', error);
    // return res.status(500).send({ message: 'user error' });
    return handleRefreshError(res, 500, 'user error');
  }
}

export async function checkUserController(req: ReqMod, res: Response) {
  const { user } = req;
  if (!user) {
    console.log('no user in check');
    return res.status(401).send({ message: 'do login' });
  }
  return res.send({
    name: user.name,
    email: user.email,
    id: user._id,
    role: user.role,
    username: user.username,
    phone: user.phone,
    status: user.status,
    profileImg: user.profileImg,
    workspaces: user.workspaces,
  });
}
