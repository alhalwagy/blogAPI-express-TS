import express from 'express';
import {
  deleteUser,
  searchUsers,
  updateUser,
  updateUserImage,
} from '../controllers/userController';
import {
  createUser,
  getAllUsers,
  getUser,
} from '../controllers/userController';
import { uploadUserImage, resizeUserPhoto } from '../utils/multer';
import { protect } from '../middlewares/protectMiddleware';

export const userRouter = express.Router();

userRouter.route('/').get(getAllUsers).post(createUser);

userRouter.route('/finduser/').get(searchUsers);

userRouter.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

userRouter
  .route('/uploaduserimage')
  .post(protect, uploadUserImage, resizeUserPhoto, updateUserImage);
