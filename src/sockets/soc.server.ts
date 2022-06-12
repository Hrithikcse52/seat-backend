import { Namespace } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { getSocketRoom } from '../utils/index.utils';

export function initializeSocket(msgSoc: Namespace<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>) {
  msgSoc.on('connection', (socket) => {
    const { username, id } = socket.handshake.query;
    console.log('room: ', `${username}_${id}`);
    console.log('rooms:', socket.rooms);
    if (username && id) {
      const roomName = getSocketRoom(username as string, id as string);
      socket.join(roomName);
      socket.broadcast.emit('user_active', { username, id });
      console.log('consection sec', username, id);
      socket.on('disconnect', (args) => {
        console.log('discon args', args);
        socket.leave(roomName);
      });
    }
  });
}
