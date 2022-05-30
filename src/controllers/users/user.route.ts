import { Router } from 'express';
import multer from 'multer';
import { storage } from '../../lib/storage.lib';
import { isAuth } from '../../middlewares/auth.middleware';
import {
  checkUserController,
  createOG,
  editUserController,
  loginController,
  logoutHandler,
  refreshController,
  registerHandler,
  userNameValidator,
} from './user.controller';

const upload = multer({ storage });

export const router = Router();

router.post('/register', registerHandler);
router.get('/logout', logoutHandler);
router.post('/login', loginController);
router.post('/username', userNameValidator);
router.get('/refresh', refreshController);
router.post('/edit', isAuth, upload.single('image'), editUserController);
router.get('/check', isAuth, checkUserController);
router.get('/og', createOG);
