import { Router } from 'express';
import { hash, compare } from 'bcrypt';
import { verify } from 'jsonwebtoken';
import { FRONT_END_URL, REFRESH_TOKEN_SECRET } from '../../config';
import { createUser, getUser } from '../../databaseQueries/user.queries';
import { RefreshTokenPayload } from '../../types/token.types';
import { clearTokens, buildTokens, setTokens } from '../../utils/token.utils';

export const router = Router();

router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, phoneNumber } = req.body;
    if (!(firstName && lastName && email && password && phoneNumber)) {
      return res.status(400).send({ message: 'improper query', data: null });
    }
    const encryptPass = await hash(password, 10);
    const {
      code,
      data: user,
      message,
    } = await createUser({
      email,
      name: {
        firstName,
        lastName,
      },
      phone: {
        number: phoneNumber,
      },
      password: encryptPass,
    });
    if (code !== 200) {
      return res.status(code).send({ message, data: user });
    }
    console.log(code, user, message, 'user 35');
    return res.send(user);
  } catch (error) {
    console.log('error while creating user, user controller line 35', error);
    return res
      .status(500)
      .send({ message: 'something went wrong', data: error });
  }
});

router.get('/logout', async (req, res) => {
  clearTokens(res);
  res.status(201).send({ user: null });
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('login body', req.body);
    if (!(email && password)) {
      return res.status(400).send({ message: 'improper query', data: null });
    }
    const { code, data: user, message } = await getUser({ email });
    if (code !== 200 || !user) {
      return res.status(code).send({ message, data: user });
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
    return res
      .status(500)
      .send({ message: 'something went wrong', data: error });
  }
});

router.get('/check', async (req, res) => {
  const { refresh } = req.cookies;
  if (!refresh) {
    return res.status(403).send({ user: null });
  }
  console.log('cookie', refresh);
  const user = verify(
    refresh,
    REFRESH_TOKEN_SECRET as string
  ) as RefreshTokenPayload;
  console.log(user);
  const { data: userData } = await getUser({ _id: user.userId });
  console.log(userData);
  return res.send({
    name: userData?.name,
    email: userData?.email,
    id: userData?._id,
  });
});
