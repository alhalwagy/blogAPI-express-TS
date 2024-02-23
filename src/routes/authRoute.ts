import express from 'express';
import { login, signup } from '../controllers/authController';
import { protect } from '../middlewares/protectMiddleware';

export const authRouter = express.Router();

authRouter.route('/signup').post(signup);
authRouter.route('/login').post(login);

authRouter.route('/').get(protect);
