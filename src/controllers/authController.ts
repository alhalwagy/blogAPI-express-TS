import { Request, Response, NextFunction } from 'express';
import { PrismaClient, User } from '@prisma/client';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { AppError } from '../utils/AppError';
import catchAsync from '../utils/catchAsync';
import {
  validationSignup,
  validationSignin,
  validationChangePassword,
} from '../validators/authValidator';
import { createSendToken } from '../utils/sendToken';
import { CustomRequest } from '../middlewares/protectMiddleware';
import { exclude } from '../validators/returnUserValidation';
import { sendEmail } from '../utils/emails/email';
import { verifyEmail } from '../utils/emails/verifyEmailTemplates';
import { validationresetPassword } from '../validators/authValidator';

const prisma = new PrismaClient();

export const signup = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { error } = validationSignup(req.body);

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
        verificationToken: crypto.randomBytes(32).toString('hex'),
      },
    });
    await sendEmail(
      newUser.email,
      'verify Your Email',
      verifyEmail(newUser.verificationToken)
    );

    createSendToken(newUser, 201, res);
  }
);

export const login = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { error } = validationSignin(req.body);

    if (error)
      return next(new AppError('email and password must be send.', 400));

    const { email, password } = req.body;

    const user: User | null = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !(await bcrypt.compare(password, user.password)))
      return next(new AppError('email or password is incorrect.', 401));

    if (!user.isVerified || user.verificationToken) {
      return next(new AppError('Please verify your account', 400));
    }

    createSendToken(user, 200, res);
  }
);

export const changePassword = catchAsync(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const { error } = validationChangePassword(req.body);
    if (error) {
      return next(new AppError(error.details[0].message, 400));
    }

    const { currentPassword, password, passwordConfirm } = req.body;
    const user = await prisma.user.findUnique({
      where: { email: req.user?.email },
    });
    if (!user) {
      return next(new AppError('User Not Found.', 404));
    }
    if (!(await bcrypt.compare(currentPassword, user.password))) {
      return next(new AppError('password is incorrect. Forget Password?', 401));
    }
    const hashPassword = await bcrypt.hash(password, 12);
    await prisma.user.update({
      where: {
        email: user.email,
      },
      data: {
        password: hashPassword,
      },
    });
    res.status(200).json({ message: 'password has been changed.' });
  }
);

export const updateMe = catchAsync(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    if (req.body.password) {
      return next(new AppError('this route not for update password.', 403));
    }
    console.log(req.body);
    if (Object.keys(req.body).length === 0) {
      return next(
        new AppError('Request must have data which need to update.', 400)
      );
    }

    if (req.body.id) {
      return next(new AppError('Not allowed to update the id', 403));
    }

    const user = await prisma.user.update({
      where: { email: req.user?.email },
      data: req.body,
    });

    const excludedUser = exclude(user, ['password', 'passwordChangedAt']);

    res.status(200).json({
      status: 'success',
      data: {
        excludedUser,
      },
    });
  }
);

export const verifyEmailToken = catchAsync(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const user = await prisma.user.findFirst({
      where: { verificationToken: req.params.taken },
    });
    if (!user) {
      return next(new AppError('Wrong vrification url.', 401));
    }

    const updatedUser = await prisma.user.update({
      where: { email: user.email },
      data: {
        isVerified: true,
        verificationToken: null,
      },
    });

    const excludedUser = exclude(updatedUser, [
      'password',
      'passwordChangedAt',
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        excludedUser,
      },
    });
  }
);

export const forgetPassword = catchAsync(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    if (!req.body.email) {
      return next(new AppError('email is required to sent', 400));
    }

    const user = await prisma.user.findUnique({
      where: { email: req.body.email },
    });

    if (!user)
      return next(
        new AppError('User Not Found. Please Create an account.', 404)
      );

    const passwordResetToken = crypto.randomBytes(32).toString('hex');
    crypto.createHash('sha256').update(passwordResetToken).digest('hex');
    const passwordResetExpires = new Date(
      Date.now() + 10 * 60 * 1000
    ).toISOString();

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        passwordResetToken,
        passwordResetExpires,
      },
    });

    const resetUrl = `${process.env.BASE_URL}/api/v1/auth/resetPassword/${passwordResetToken}`;
    const message = `We have a received a password reset request. Please use the below link to reset you password\n\n${resetUrl}\n\nThis reset password link will be valid only for 10 minutes`;
    await sendEmail(user.email, 'Password change request received', message);

    res.status(200).json({
      message: 'We sent to you an email, please verify your email',
    });
  }
);

export const resetPasswordHandler = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { error } = validationresetPassword(req.body);
    if (error) return next(new AppError(error.details[0].message, 400));

    const token = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: req.params.token,
        passwordResetExpires: {
          gt: new Date().toISOString(),
        },
      },
    });
    if (!user) {
      return next(new AppError('Token is invalid or expired', 404));
    }

    const { password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    res.status(200).json({ message: 'password Updated Successfuly.' });
  }
);
