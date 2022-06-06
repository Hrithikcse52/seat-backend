import { Router } from 'express';
import { isAuth } from '../../middlewares/auth.middleware';
import {
  createConversationController,
  getChatController,
  getConversationController,
  sendMessageController,
} from './message.controller';

const router = Router();

router.get('/index', isAuth, getConversationController);
router.post('/create', isAuth, createConversationController);
// middle ware if conversation model is accesed
router.get('/chat/:conversation', isAuth, getChatController);
router.post('/send', isAuth, sendMessageController);

export { router };
