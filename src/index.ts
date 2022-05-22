import express, { Application } from 'express';
import 'dotenv/config';
import { connect } from 'mongoose';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { MONGO_URI, FRONT_END_URL, PORT, NODE_ENV } from './config';
import { router as userRoute } from './controllers/users/user.route';
import { router as workSpaceRoute } from './controllers/workspace/workspace.route';
import { router as metaRoute } from './controllers/meta/meta.route';
// import { FRONT_END_URL, MONGO_URI, PORT } from './config';

const app: Application = express();
(async () => {
  try {
    await connect(MONGO_URI!);
    console.log('DB Connected! ', NODE_ENV);
  } catch (error) {
    console.log('Error connecting DB', error);
  }
})();

app.use(cors({ credentials: true, origin: FRONT_END_URL }));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/user', userRoute);
app.use('/workspace', workSpaceRoute);
app.use('/meta', metaRoute);

app.get('/', (req, res) => {
  res.send({ message: 'server is up and running' });
});
app.listen(PORT, () => {
  console.log(`server up and running at ${PORT}`);
});
