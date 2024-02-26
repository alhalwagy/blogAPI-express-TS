import express from 'express';
import {
  changetActiveAccount,
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
import { uploadImage, resizeUserPhoto } from '../utils/multer';
import { protect } from '../middlewares/protectMiddleware';
import { restrictToAdmin } from '../middlewares/authorizationMiddleware';

export const userRouter = express.Router();

userRouter.use(protect);

userRouter
  .route('/')
  .get(restrictToAdmin, getAllUsers)
  .post(restrictToAdmin, createUser);

userRouter.route('/finduser/').get(searchUsers);

userRouter.route('/activateaccount/').patch(changetActiveAccount);

userRouter
  .route('/uploaduserimage')
  .post(uploadImage, resizeUserPhoto, updateUserImage);

userRouter
  .route('/:id')
  .get(getUser)
  .patch(updateUser)
  .delete(restrictToAdmin, deleteUser);
