import { msgSoc } from '../server';

console.log('msgsoc', msgSoc);
export function sendMessage(user: string, message: string) {
  console.log('ws send', user, message);
  msgSoc.to(user).emit('newMsg', message);
}
