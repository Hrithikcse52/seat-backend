import { Router } from 'express';
import { isAuth } from '../../middlewares/auth.middleware';
import {
  checkUserController,
  loginController,
  logoutHandler,
  refreshController,
  registerHandler,
} from './user.controller';

export const router = Router();

router.post('/register', registerHandler);
router.get('/logout', logoutHandler);
router.post('/login', loginController);
router.get('/refresh', refreshController);
router.get('/check', isAuth, checkUserController);
