import { Response } from 'express';
import { chatModel } from '../../models/chat.model';
import { conversationModel } from '../../models/conversation.model';
import { ReqMod } from '../../types/util.types';
import { handleAPIError } from '../../utils/error.handler';

export async function getConversationController(req: ReqMod, res: Response) {
  const { user } = req;
  if (!user) {
    return handleAPIError(res, null, 400, 'Invalid Request');
  }
  const conversation = await conversationModel
    .find({ participants: { $in: user._id } })
    .populate('participants', 'username name profileImg');

  return res.send(conversation);
}

export async function createConversationController(req: ReqMod, res: Response) {
  const { user } = req.body;
  const { user: curUser } = req;
  if (!user) {
    return handleAPIError(res, null, 400, 'Invalid Request');
  }
  const payload = {
    participants: [user, curUser],
  };
  let newConversation = await conversationModel.create(payload);
  console.log('before population', newConversation);
  newConversation = await newConversation.populate('participants', 'username name profileImg');
  console.log('after population', newConversation);
  return res.send(newConversation);
}

export async function getChatController(req: ReqMod, res: Response) {
  const { conversation } = req.params;
  if (!conversation) {
    return handleAPIError(res, null, 400, 'invalid request');
  }
  const chats = await chatModel.find({ conversation }).sort({ createdAt: 1 }).exec();
  console.log('chats', chats, conversation);
  return res.send(chats);
}

export async function sendMessageController(req: ReqMod, res: Response) {
  const { receiver, message, conversation } = req.body;
  if (!(receiver && message && conversation)) {
    return handleAPIError(res, null, 400, 'invalid request');
  }
  const { user } = req;
  if (!user) {
    return handleAPIError(res, null, 401, 'Not Auth');
  }
  const payload = {
    sender: user._id,
    receiver,
    message,
    conversation,
  };
  const newChat = await chatModel.create(payload);

  return res.send(newChat);
}
