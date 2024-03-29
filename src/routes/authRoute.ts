import express from 'express';
import {
  changePassword,
  forgetPassword,
  login,
  resetPassword,
  signup,
  updateMe,
  verifyEmailToken,
} from '../controllers/authController';
import { protect } from '../middlewares/protectMiddleware';
import { restrictToAdmin } from '../middlewares/authorizationMiddleware';

export const authRouter = express.Router();

authRouter.route('/signup').post(signup);
authRouter.route('/login').post(login);

authRouter.route('/changemypassword').patch(protect, changePassword);
authRouter.route('/updatemyprofile').patch(protect, updateMe);

authRouter.route('/verify/:token').patch(verifyEmailToken);
authRouter.route('/forgetpassword').get(forgetPassword);
authRouter.route('/resetpassword/:token').patch(resetPassword);
