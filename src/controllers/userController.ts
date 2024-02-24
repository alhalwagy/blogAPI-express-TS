import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { User } from '@prisma/client';
import catchAsync from '../utils/catchAsync';
import { validationSignup } from '../validators/authValidator';
import { AppError } from '../utils/AppError';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { sendEmail } from '../utils/emails/email';
import { verifyEmail } from '../utils/emails/verifyEmailTemplates';
import {
  excludeFromUsersArray,
  exclude,
} from '../validators/returnUserValidation';

const prisma = new PrismaClient();

export const createUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { error } = validationSignup(req.body);
    if (error) return next(new AppError(error.details[0].message, 400));

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
        verificationToken: crypto.randomBytes(32).toString('hex'),
      },
    });
    await sendEmail(
      newUser.email,
      'verify Your Email',
      verifyEmail(newUser.verificationToken)
    );

    res
      .status(201)
      .json({ message: 'Account has been created and recived mail.' });
  }
);

export const getAllUsers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const users = await prisma.user.findMany({});

    if (users.length === 0) {
      return next(new AppError('No Users Found', 404));
    }

    const excludedUsers = excludeFromUsersArray(users, ['password']);
    res.status(200).json({
      status: 'success',
      result: excludedUsers.length,
      excludedUsers,
    });
  }
);

export const getUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(req.params.id) },
    });

    if (!user) return next(new AppError('User not found', 404));

    const excludedUser = exclude(user, ['password']);

    res.status(200).json({
      status: 'success',
      data: {
        excludedUser,
      },
    });
  }
);

export const updateUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (req.body.password) {
      return next(new AppError('Not allowed to update Password here.', 401));
    }
    await prisma.user
      .update({
        where: { id: parseInt(req.params.id) },
        data: req.body,
      })
      .then((user) =>
        res.status(200).json({
          status: 'success',
          data: {
            user,
          },
        })
      )
      .catch(() => next(new AppError('User Not found', 404)));
  }
);

export const deleteUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    await prisma.user
      .delete({ where: { id: parseInt(req.params.id) } })
      .then(() =>
        res.status(204).json({ message: 'user has been deleted successfuly.' })
      )
      .catch(() => next(new AppError('User not found.', 404)));
  }
);

export const searchUsers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userName, email, phone } = req.query;

    if (userName || email) {
      const users = await prisma.user.findMany({
        where: {
          userName: {
            contains: userName?.toString(),
          },
          email: {
            contains: email?.toString(),
          },
          phone: {
            contains: phone?.toString(),
          },
        },
      });
      res.status(200).json({ users });
    } else {
      res.status(200).json({});
    }
  }
);
