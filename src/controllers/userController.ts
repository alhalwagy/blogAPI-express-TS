import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { User } from '@prisma/client';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';

import { AppError } from '../utils/AppError';
import catchAsync from '../utils/catchAsync';
import { validationSignup } from '../validators/authValidator';
import { sendEmail } from '../utils/emails/email';
import { verifyEmail } from '../utils/emails/verifyEmailTemplates';
import {
  excludeFromUsersArray,
  exclude,
} from '../validators/returnUserValidation';
import { CustomRequest } from '../middlewares/protectMiddleware';
import {
  cloudinaryRemoveImage,
  cloudinaryUploadImage,
} from '../utils/cloudinaryImage';

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
    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id: parseInt(id) } });

    if (!user) return next(new AppError('User not found.', 404));
    if (user.imageId !== '') await cloudinaryRemoveImage(user.imageId!);

    // const posts = await prisma.post.findMany({
    //   where: { writerId: parseInt(id) },
    // });
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

export const updateUserImage = catchAsync(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    if (!req.file) return next(new AppError('No image provided.', 400));
    console.log();
    const imagePath = path.join(__dirname, `../../images/${req.file.filename}`);
    const result = await cloudinaryUploadImage(imagePath);

    const user = await prisma.user.findUnique({ where: { id: req.user?.id } });
    console.log(user);
    if (user?.imageId !== '') {
      await cloudinaryRemoveImage(user?.imageId!);
    }
    if (result) {
      user!.image = (result as any).secure_url;
      user!.imageId = (result as any).public_id;
    }
    console.log(user);
    await prisma.user.update({
      where: { id: user?.id },
      data: { image: user?.image, imageId: user?.imageId },
    });

    res.status(200).json({
      status: 'success',
      message: 'image profile uploaded successfuly.',
      url: result?.secure_url,
      imageid: result?.public_id,
    });

    fs.unlinkSync(imagePath);
  }
);

export const changetActiveAccount = catchAsync(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    let user;
    if (req.user?.isActive) {
      user = await prisma.user.update({
        where: { id: req.user?.id },
        data: { isActive: false },
      });
    } else {
      user = await prisma.user.update({
        where: { id: req.user?.id },
        data: { isActive: true },
      });
    }
    if (!user) {
      return next(new AppError('User not found.', 404));
    }
    res.status(200).json({
      status: 'success',
      message: 'account has been un activated.',
      data: exclude(user, ['password']),
    });
  }
);
