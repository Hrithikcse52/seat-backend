import { NextFunction, Response, Request } from 'express';
// export function authMiddleware(
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) {
//   console.log('cookies', req.cookies);
//   //   const token = verifyAccessToken(req.cookies[Cookies.AccessToken]);

//   //   if (!token) {
//   //     res.status(401);
//   //     return next(new Error('Not Signed in'));
//   //   }

//   //   res.user = token;

//   next();
// }
export function isAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies;
  console.log('token', token);
  res.cookie('', '');
  next();
}
