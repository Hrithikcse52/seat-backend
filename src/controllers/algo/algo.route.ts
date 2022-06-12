import { Router } from 'express';
import { isAuth } from '../../middlewares/auth.middleware';
import { getTrendingController } from './algo.controller';

export const router = Router();

router.get('/trending', getTrendingController);
