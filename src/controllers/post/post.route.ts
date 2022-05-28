import { Router } from 'express';
import { isAuth } from '../../middlewares/auth.middleware';
import { create, index } from './post.controller';

export const router = Router();

router.post('/create', isAuth, create);
router.post('/', isAuth, index);
