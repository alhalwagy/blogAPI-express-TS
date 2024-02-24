import express from 'express';
import {
  deleteUser,
  searchUsers,
  updateUser,
} from '../controllers/userController';
import {
  createUser,
  getAllUsers,
  getUser,
} from '../controllers/userController';

export const userRouter = express.Router();

userRouter.route('/').get(getAllUsers).post(createUser);

userRouter.route('/finduser/').get(searchUsers);

userRouter.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);
