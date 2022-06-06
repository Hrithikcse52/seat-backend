import { Namespace } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';

export function initializeSocket(msgSoc: Namespace<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>) {
  msgSoc.on('connection', (socket) => {
    const { username, id } = socket.handshake.query;
    console.log('room: ', `${username}_${id}`);
    socket.join(`${username}_${id}`);
    console.log('consection sec', username, id);
    socket.on('disconnect', (args) => {
      console.log('discon args', args);
      socket.leave(`${username}_${id}`);
    });
  });
}
