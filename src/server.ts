import express, { Application } from 'express';
import { connect } from 'mongoose';
import { Server } from 'socket.io';
import { createServer } from 'http';
import { initializeSocket } from './sockets/soc.server';

import { FRONT_END_URL, MONGO_URI, NODE_ENV, PORT } from './config';
import 'dotenv/config';

const server: Application = express();

const httpServer = createServer(server);
const io = new Server(httpServer, {
  /* options */
  cors: {
    origin: [FRONT_END_URL!, /\.hrithik\.dev$/],
    methods: ['GET', 'POST'],
  },
});

(async () => {
  try {
    await connect(MONGO_URI!);
    console.log('DB Connected! ', NODE_ENV);
  } catch (error) {
    console.log('Error connecting DB', error);
  }
})();

const msgSoc = io.of('msg');
initializeSocket(msgSoc);

httpServer.listen(PORT, () => {
  console.log(`server up and running at ${PORT}`);
});

export { server, httpServer, io, msgSoc };
