import { ChatDocument } from '../models/chat.model';
import { msgSoc } from '../server';

export function sendMessage(user: string, message: ChatDocument) {
  console.log('ws send', user, message);
  msgSoc.to(user).emit('newMsg', message);
}
