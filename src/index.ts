import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import morgan from 'morgan';
import 'dotenv/config';

import { server } from './server';
import { FRONT_END_URL } from './config';

import { router as userRoute } from './controllers/users/user.route';
import { router as workSpaceRoute } from './controllers/workspace/workspace.route';
import { router as metaRoute } from './controllers/meta/meta.route';
import { router as blogRoute } from './controllers/blog/blog.route';
import { router as postRoute } from './controllers/post/post.route';
import { router as conversationRoute } from './controllers/message/message.route';
import { router as algoRoute } from './controllers/algo/algo.route';

server.use(cors({ credentials: true, origin: FRONT_END_URL }));
server.use(express.json());
server.use(cookieParser());
server.use(morgan('tiny'));

// Routes
server.use('/user', userRoute);
server.use('/workspace', workSpaceRoute);
server.use('/meta', metaRoute);
server.use('/blog', blogRoute);
server.use('/post', postRoute);
server.use('/conversation', conversationRoute);
server.use('/algo', algoRoute);

server.get('/', (req, res) => {
  res.send({ message: 'server is up and running' });
});

export { server };
