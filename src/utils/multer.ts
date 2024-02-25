import multer from 'multer';
import path from 'path';
import { CustomRequest } from '../utils/interfaces/CustomRequest';
import { AppError } from './AppError';
import catchAsync from './catchAsync';
import sharp from 'sharp';

const multerStorage = multer.memoryStorage();

const multerFilter = (req: CustomRequest, file: any, cb: any) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please Upload image.', 400), false);
  }
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

export const resizeUserPhoto = catchAsync(
  async (req: CustomRequest, res, next) => {
    if (!req.file) return next();

    req.file.filename = `user-${req.user?.id}-${Date.now()}.jpeg`;
    await sharp(req.file.buffer)
      .resize(500, 500)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(path.join(__dirname, `../../images/${req.file.filename}`));
    next();
  }
);

export const uploadUserImage = upload.single('image');
