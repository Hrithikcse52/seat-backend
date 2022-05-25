import multer from 'multer';
import path from 'path';
import { ROOT } from '../config';
import { ReqMod } from '../types/util.types';

export const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, path.join(ROOT, 'uploads/'));
  },
  filename(req: ReqMod, file, cb) {
    const { user } = req;
    console.log('file uploading----', file);
    if (user) {
      let name = `${user._id}`;
      if (file.mimetype === 'image/jpeg') name += '.jpeg';
      else if (file.mimetype === 'image/png') name += '.png';
      else cb(new Error('file Format check'), '');
      cb(null, name);
    } else {
      cb(new Error('user not looged'), '');
    }
  },
});
