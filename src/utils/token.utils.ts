import { CookieOptions, Response } from 'express';
import { sign } from 'jsonwebtoken';
import { isProd, ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } from '../config';
import { UserDocument } from '../models/users/user.model';
import {
  AccessTokenPayload,
  RefreshTokenPayload,
  Cookies,
} from '../types/token.types';

enum TokenExpiration {
  Access = 5 * 60,
  Refresh = 7 * 24 * 60 * 60,
  RefreshIfLessThan = 4 * 24 * 60 * 60,
}

const defaultCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? 'strict' : 'lax',
  // domain: FRONT_END_URL,
  path: '/',
};

const refreshTokenCookieOptions: CookieOptions = {
  ...defaultCookieOptions,
  maxAge: TokenExpiration.Refresh * 1000,
};

const accessTokenCookieOptions: CookieOptions = {
  ...defaultCookieOptions,
  maxAge: TokenExpiration.Access * 1000,
};

function signAccessToken(payload: AccessTokenPayload) {
  return sign(payload, ACCESS_TOKEN_SECRET as string, {
    expiresIn: TokenExpiration.Access,
  });
}

function signRefreshToken(payload: RefreshTokenPayload) {
  return sign(payload, REFRESH_TOKEN_SECRET!, {
    expiresIn: TokenExpiration.Refresh,
  });
}

export function setTokens(res: Response, access: string, refresh?: string) {
  res.cookie(Cookies.AccessToken, access, accessTokenCookieOptions);
  if (refresh)
    res.cookie(Cookies.RefreshToken, refresh, refreshTokenCookieOptions);
}

export function buildTokens(user: UserDocument) {
  const accessPayload: AccessTokenPayload = { userId: user._id };
  const refreshPayload: RefreshTokenPayload = {
    userId: user._id,
    version: user.tokenVersion,
  };

  const accessToken = signAccessToken(accessPayload);
  const refreshToken = refreshPayload && signRefreshToken(refreshPayload);

  return { accessToken, refreshToken };
}

export function clearTokens(res: Response) {
  // res.cookie(Cookies.AccessToken, '', { ...defaultCookieOptions, maxAge: 0 });
  // res.cookie(Cookies.RefreshToken, '', { ...defaultCookieOptions, maxAge: 0 });
  res.clearCookie(Cookies.AccessToken, { path: defaultCookieOptions.path });
  res.clearCookie(Cookies.RefreshToken, { path: defaultCookieOptions.path });
}
