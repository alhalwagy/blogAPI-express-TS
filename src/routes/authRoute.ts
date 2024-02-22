import express from 'express';
import { signup } from '../controllers/authController';

export const authRouter = express.Router();

authRouter.route('/signup').post(signup);
