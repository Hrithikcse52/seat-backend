import { Router } from 'express';
import { isAuth } from '../../middlewares/auth.middleware';
import { addLikeComment, create, index } from './post.controller';

export const router = Router();

router.post('/create', isAuth, create);
router.get('/', isAuth, index);
router.post('/reaction', isAuth, addLikeComment);
router.get('/:postid', isAuth, index);
