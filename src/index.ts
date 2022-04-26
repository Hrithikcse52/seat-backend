import express, { Application } from 'express';
import 'dotenv/config';
import { connect } from 'mongoose';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { router as userController } from './controllers/users/user.controller';
import { FRONT_END_URL, MONGO_URI, PORT } from './config';

const app: Application = express();
(async () => {
  try {
    await connect(MONGO_URI!);
    console.log('DB Connected!');
  } catch (error) {
    console.log('Error connecting DB', error);
  }
})();

app.use(cors({ credentials: true, origin: FRONT_END_URL }));
app.use(express.json());
app.use(cookieParser());

// controllers
app.use('/user', userController);

app.get('/', (req, res) => {
  res.send({ message: 'server is up and running' });
});
app.listen(PORT, () => {
  console.log(`server up and running at ${PORT}`);
});
