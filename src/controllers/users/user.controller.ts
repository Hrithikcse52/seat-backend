/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable no-param-reassign */
import { Request, Response } from 'express';
import { hash, compare } from 'bcrypt';
import { CanvasRenderingContext2D, createCanvas, loadImage } from 'canvas';
import fs, { createWriteStream } from 'fs';
import path from 'path';
import { verify } from 'jsonwebtoken';
import { FRONT_END_URL, REFRESH_TOKEN_SECRET, ROOT } from '../../config';
import { createUser, getUser, incTokenVersion, updateUser } from '../../databaseQueries/user.queries';
import { clearTokens, buildTokens, setTokens } from '../../utils/token.utils';
import { RefreshTokenPayload } from '../../types/token.types';
import { ReqMod } from '../../types/util.types';
import { uploadImage } from '../../lib/supabase.lib';
import { handleAPIError } from '../../utils/error.handler';

export async function registerHandler(req: Request, res: Response) {
  try {
    const { firstName, lastName, email, username, password, profileImg } = req.body;
    if (!(firstName && lastName && email && password && username)) {
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

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  if (w < 2 * r) r = w / 2;
  if (h < 2 * r) r = h / 2;

  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export async function createOG(userImage: string, username: string) {
  const canvas = createCanvas(1200, 630);
  const ctx = canvas.getContext('2d');
  const bgImage = await loadImage(
    'https://us-central1-centered-1580668301240.cloudfunctions.net/randomPhoto?collectionId=j1fwrKAGDIg'
  );

  // center fill
  const hRatio = canvas.width / bgImage.width;
  const vRatio = canvas.height / bgImage.height;
  const ratio = Math.max(hRatio, vRatio);
  const centerShiftX = (canvas.width - bgImage.width * ratio) / 2;
  const centerShiftY = (canvas.height - bgImage.height * ratio) / 2;

  ctx.drawImage(
    bgImage,
    0,
    0,
    bgImage.width,
    bgImage.height,
    centerShiftX,
    centerShiftY,
    bgImage.width * ratio,
    bgImage.height * ratio
  );

  ctx.rect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#000000aa';
  ctx.fill();

  const posterImage = await loadImage(userImage);

  ctx.save();

  roundedRect(ctx, 814, 51, 336, 528, 10);

  ctx.clip();

  ctx.drawImage(posterImage, 814, 51, 336, 528);

  ctx.restore();

  const logoImage = await loadImage(
    'https://wxmwctiasizeoqlubrjn.supabase.co/storage/v1/object/public/seat/logo/membook.svg'
  );

  ctx.drawImage(logoImage, 121, 252, 462, 114);
  return canvas.toBuffer();
}

export async function editUserController(req: ReqMod, res: Response) {
  try {
    console.log('req', req.body, req.headers, req.files, req.file);
    const { user, file } = req;
    if (!user) {
      return res.status(500).send({ message: 'user Error' });
    }
    const { firstName, lastName, email } = req.body;
    const updateDoc: {
      name?: {
        firstName?: string;
        lastName?: string;
      };
      email?: string;
      profileImg?: string;
      ogImage?: string;
    } = {};
    if (file && user) {
      const newFile = fs.readFileSync(file.path);
      console.log('file', newFile);
      const { data, error } = await uploadImage(
        'seat',
        `users/${`${user.username}_${user._id}`}/`,
        file.filename,
        file,
        newFile
      );
      console.log('data', data, error);
      if (!data || error) {
        return res.status(500).send({ message: 'Something went Wring', error });
      }
      updateDoc.profileImg = data.publicURL;
      const ogImageFile = await createOG(updateDoc.profileImg, user.username);

      const { data: ogData, error: ogErr } = await uploadImage(
        'seat',
        `ogImages/${`${user.username}_${user._id}`}/`,
        `${Date.now()}_${user._id}`,
        null,
        ogImageFile
      );
      console.log('ogdata', ogData, ogErr);
      if (ogData) {
        updateDoc.ogImage = ogData.publicURL;
      }
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
        _id: user._id,
        email: user.email,
        name: user.name,
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
    _id: user._id,
    role: user.role,
    username: user.username,
    status: user.status,
    profileImg: user.profileImg,
  });
}
