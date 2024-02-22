import { Request, Response, NextFunction } from 'express';
import { PrismaClient, User } from '@prisma/client';
import bcrypt from 'bcrypt';
import { AppError } from '../utils/AppError';
import catchAsync from '../utils/catchAsync';
import { validationsignup } from '../validators/authValidator';
import { createSendToken } from '../utils/sendToken';

const prisma = new PrismaClient();

export const signup = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { error } = validationsignup(req.body);

    if (error) {
      return next(new AppError(error.details[0].message, 400));
    }
    const { email, password, userName, firstName, lastName } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (user) return next(new AppError('User is already exist.', 400));

    const hashPassword = await bcrypt.hash(password, 12);

    const newUser: User = await prisma.user.create({
      data: {
        userName,
        password: hashPassword,
        email,
        firstName,
        lastName,
      },
    });

    createSendToken(newUser, 201, res);
  }
);
