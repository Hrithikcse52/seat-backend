import { Response } from 'express';
import { isEqual, orderBy } from 'lodash';
import { chatModel } from '../../models/chat.model';
import { conversationModel } from '../../models/conversation.model';
import { sendMessage } from '../../sockets/msg.socket';
import { ReqMod } from '../../types/util.types';
import { handleAPIError } from '../../utils/error.handler';
import { getSocketRoom } from '../../utils/index.utils';

export async function getConversationController(req: ReqMod, res: Response) {
  const { user } = req;
  if (!user) {
    return handleAPIError(res, null, 400, 'Invalid Request');
  }
  const conversation = await conversationModel
    .find({ participants: { $in: user._id } })
    .populate('participants', 'username name profileImg')
    .sort({ createdAt: -1 })
    .lean();

  const conversationId = conversation.map((conv) => conv._id);
  console.log('conversation ids', conversationId);
  const chats = await chatModel
    .find({ conversation: { $in: conversationId } })
    .sort({ createdAt: -1 })
    .lean();

  let modConversation = conversation.map((conv: any) => {
    // eslint-disable-next-line no-param-reassign
    conv.chat = chats.find((ch) => isEqual(ch.conversation, conv._id)) ?? {};
    return conv;
  });

  console.log('conversations', conversation, modConversation);
  modConversation = orderBy(modConversation, ['chat.createdAt'], ['desc']);
  return res.send(modConversation);
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
  return res.send(chats);
}

export async function sendMessageController(req: ReqMod, res: Response) {
  const { receiver, receiverUsername, message, conversation } = req.body;
  if (!(receiver && message && receiverUsername && conversation)) {
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
  const roomName = getSocketRoom(receiverUsername as string, receiver as string);
  sendMessage(roomName, newChat);
  return res.send(newChat);
}
